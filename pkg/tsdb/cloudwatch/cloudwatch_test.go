package cloudwatch

import (
	"context"
	"encoding/json"
	"github.com/aws/aws-sdk-go/service/cloudwatchlogs"
	"github.com/stretchr/testify/assert"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cloudwatchlogs/cloudwatchlogsiface"
	"github.com/google/go-cmp/cmp"
	"github.com/grafana/grafana-aws-sdk/pkg/awsds"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana/pkg/infra/httpclient"
	"github.com/stretchr/testify/require"
)

func TestNewInstanceSettings(t *testing.T) {
	tests := []struct {
		name       string
		settings   backend.DataSourceInstanceSettings
		expectedDS datasourceInfo
		Err        require.ErrorAssertionFunc
	}{
		{
			name: "creates a request",
			settings: backend.DataSourceInstanceSettings{
				JSONData: []byte(`{
					"profile": "foo",
					"defaultRegion": "us-east2",
					"assumeRoleArn": "role",
					"externalId": "id",
					"endpoint": "bar",
					"customMetricsNamespaces": "ns",
					"authType": "keys"
				}`),
				DecryptedSecureJSONData: map[string]string{
					"accessKey": "A123",
					"secretKey": "secret",
				},
			},
			expectedDS: datasourceInfo{
				profile:       "foo",
				region:        "us-east2",
				assumeRoleARN: "role",
				externalID:    "id",
				endpoint:      "bar",
				namespace:     "ns",
				authType:      awsds.AuthTypeKeys,
				accessKey:     "A123",
				secretKey:     "secret",
			},
			Err: require.NoError,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			f := NewInstanceSettings(httpclient.NewProvider())
			model, err := f(tt.settings)
			tt.Err(t, err)
			datasourceComparer := cmp.Comparer(func(d1 datasourceInfo, d2 datasourceInfo) bool {
				return d1.profile == d2.profile &&
					d1.region == d2.region &&
					d1.authType == d2.authType &&
					d1.assumeRoleARN == d2.assumeRoleARN &&
					d1.externalID == d2.externalID &&
					d1.namespace == d2.namespace &&
					d1.endpoint == d2.endpoint &&
					d1.accessKey == d2.accessKey &&
					d1.secretKey == d2.secretKey &&
					d1.datasourceID == d2.datasourceID
			})
			if !cmp.Equal(model.(datasourceInfo), tt.expectedDS, datasourceComparer) {
				t.Errorf("Unexpected result. Expecting\n%v \nGot:\n%v", model, tt.expectedDS)
			}
		})
	}
}

func Test_executeLogAlertQuery(t *testing.T) {
	origNewCWClient := NewCWClient
	t.Cleanup(func() {
		NewCWClient = origNewCWClient
	})

	var cli FakeCWLogsClient
	NewCWLogsClient = func(sess *session.Session) cloudwatchlogsiface.CloudWatchLogsAPI {
		return &cli
	}

	t.Run("sets region from input JSON", func(t *testing.T) {
		cli = FakeCWLogsClient{queryResults: cloudwatchlogs.GetQueryResultsOutput{Status: pointerString("Complete")}}
		im := datasource.NewInstanceManager(func(s backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
			return datasourceInfo{}, nil
		})
		sess := fakeSessionCache{}

		executor := newExecutor(im, newTestConfig(), &sess)
		_, err := executor.QueryData(context.Background(), &backend.QueryDataRequest{
			Headers:       map[string]string{"FromAlert": "some value"},
			PluginContext: backend.PluginContext{DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{}},
			Queries: []backend.DataQuery{
				{
					TimeRange: backend.TimeRange{From: time.Unix(0, 0), To: time.Unix(1, 0)},
					JSON: json.RawMessage(`{
						"queryMode":    "Logs",
						"region": "some region"
					}`),
				},
			},
		})
		assert.NoError(t, err)

		assert.Equal(t, []string{"some region"}, sess.callRegions)
	})

	t.Run("gets region from instance manager when set to default", func(t *testing.T) {
		cli = FakeCWLogsClient{queryResults: cloudwatchlogs.GetQueryResultsOutput{Status: pointerString("Complete")}}
		im := datasource.NewInstanceManager(func(s backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
			return datasourceInfo{region: "instance's region"}, nil
		})
		sess := fakeSessionCache{}

		executor := newExecutor(im, newTestConfig(), &sess)
		_, err := executor.QueryData(context.Background(), &backend.QueryDataRequest{
			Headers:       map[string]string{"FromAlert": "some value"},
			PluginContext: backend.PluginContext{DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{}},
			Queries: []backend.DataQuery{
				{
					TimeRange: backend.TimeRange{From: time.Unix(0, 0), To: time.Unix(1, 0)},
					JSON: json.RawMessage(`{
						"queryMode":    "Logs",
						"region": "default"
					}`),
				},
			},
		})
		assert.NoError(t, err)

		assert.Equal(t, []string{"instance's region"}, sess.callRegions)
	})
}

func Test_getSession(t *testing.T) {
	t.Run("gets region from instance manager when set to default", func(t *testing.T) {
		im := datasource.NewInstanceManager(func(s backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
			return datasourceInfo{region: "instance's region"}, nil
		})
		sess := fakeSessionCache{}
		executor := newExecutor(im, newTestConfig(), &sess)

		_, err := executor.newSession(
			backend.PluginContext{DataSourceInstanceSettings: &backend.DataSourceInstanceSettings{}},
			"default")

		assert.NoError(t, err)
		assert.Equal(t, []string{"instance's region"}, sess.callRegions)
	})
}
