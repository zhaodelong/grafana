package streaming_test

import (
	"math"
	"testing"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/grafana/pkg/tsdb/prometheus/query"
	apiv1 "github.com/prometheus/client_golang/api/prometheus/v1"
	p "github.com/prometheus/common/model"
	"github.com/stretchr/testify/require"
)

var now = time.Now()

func TestPrometheus_parseTimeSeriesResponse(t *testing.T) {
	t.Run("exemplars response should be sampled and parsed normally", func(t *testing.T) {
		value := make(map[query.TimeSeriesQueryType]interface{})
		exemplars := []apiv1.ExemplarQueryResult{
			{
				SeriesLabels: p.LabelSet{
					"__name__": "tns_request_duration_seconds_bucket",
					"instance": "app:80",
					"job":      "tns/app",
				},
				Exemplars: []apiv1.Exemplar{
					{
						Labels:    p.LabelSet{"traceID": "test1"},
						Value:     0.003535405,
						Timestamp: p.TimeFromUnixNano(time.Now().Add(-2 * time.Minute).UnixNano()),
					},
					{
						Labels:    p.LabelSet{"traceID": "test2"},
						Value:     0.005555605,
						Timestamp: p.TimeFromUnixNano(time.Now().Add(-4 * time.Minute).UnixNano()),
					},
					{
						Labels:    p.LabelSet{"traceID": "test3"},
						Value:     0.007545445,
						Timestamp: p.TimeFromUnixNano(time.Now().Add(-6 * time.Minute).UnixNano()),
					},
					{
						Labels:    p.LabelSet{"traceID": "test4"},
						Value:     0.009545445,
						Timestamp: p.TimeFromUnixNano(time.Now().Add(-7 * time.Minute).UnixNano()),
					},
				},
			},
		}

		value[query.ExemplarQueryType] = exemplars
		query := &query.Query{
			LegendFormat: "legend {{app}}",
		}
		res, err := parseTimeSeriesResponse(value, query)
		require.NoError(t, err)

		// Test fields
		require.Len(t, res, 1)
		require.Equal(t, res[0].Name, "exemplar")
		require.Equal(t, res[0].Fields[0].Name, "Time")
		require.Equal(t, res[0].Fields[1].Name, "Value")
		require.Len(t, res[0].Fields, 6)

		// Test correct values (sampled to 2)
		require.Equal(t, res[0].Fields[1].Len(), 2)
		require.Equal(t, res[0].Fields[1].At(0), 0.009545445)
		require.Equal(t, res[0].Fields[1].At(1), 0.003535405)
	})

	t.Run("matrix response should be parsed normally", func(t *testing.T) {
		values := []p.SamplePair{
			{Value: 1, Timestamp: 1000},
			{Value: 2, Timestamp: 2000},
			{Value: 3, Timestamp: 3000},
			{Value: 4, Timestamp: 4000},
			{Value: 5, Timestamp: 5000},
		}
		value := make(map[query.TimeSeriesQueryType]interface{})
		value[query.RangeQueryType] = p.Matrix{
			&p.SampleStream{
				Metric: p.Metric{"app": "Application", "tag2": "tag2"},
				Values: values,
			},
		}
		query := &query.Query{
			LegendFormat: "legend {{app}}",
			Step:         1 * time.Second,
			Start:        time.Unix(1, 0).UTC(),
			End:          time.Unix(5, 0).UTC(),
			UtcOffsetSec: 0,
		}
		res, err := parseTimeSeriesResponse(value, query)
		require.NoError(t, err)

		require.Len(t, res, 1)
		require.Equal(t, res[0].Name, "legend Application")
		require.Len(t, res[0].Fields, 2)
		require.Len(t, res[0].Fields[0].Labels, 0)
		require.Equal(t, res[0].Fields[0].Name, "Time")
		require.Len(t, res[0].Fields[1].Labels, 2)
		require.Equal(t, res[0].Fields[1].Labels.String(), "app=Application, tag2=tag2")
		require.Equal(t, res[0].Fields[1].Name, "Value")
		require.Equal(t, res[0].Fields[1].Config.DisplayNameFromDS, "legend Application")

		// Ensure the timestamps are UTC zoned
		testValue := res[0].Fields[0].At(0)
		require.Equal(t, "UTC", testValue.(time.Time).Location().String())
	})

	t.Run("matrix response with missed data points should be parsed correctly", func(t *testing.T) {
		values := []p.SamplePair{
			{Value: 1, Timestamp: 1000},
			{Value: 4, Timestamp: 4000},
		}
		value := make(map[query.TimeSeriesQueryType]interface{})
		value[query.RangeQueryType] = p.Matrix{
			&p.SampleStream{
				Metric: p.Metric{"app": "Application", "tag2": "tag2"},
				Values: values,
			},
		}
		query := &query.Query{
			LegendFormat: "",
			Step:         1 * time.Second,
			Start:        time.Unix(1, 0).UTC(),
			End:          time.Unix(4, 0).UTC(),
			UtcOffsetSec: 0,
		}
		res, err := parseTimeSeriesResponse(value, query)

		require.NoError(t, err)
		require.Len(t, res, 1)
		require.Equal(t, res[0].Fields[0].Len(), 2)
		require.Equal(t, time.Unix(1, 0).UTC(), res[0].Fields[0].At(0))
		require.Equal(t, time.Unix(4, 0).UTC(), res[0].Fields[0].At(1))
		require.Equal(t, res[0].Fields[1].Len(), 2)
		require.Equal(t, float64(1), *res[0].Fields[1].At(0).(*float64))
		require.Equal(t, float64(4), *res[0].Fields[1].At(1).(*float64))
	})

	t.Run("matrix response with from alerting missed data points should be parsed correctly", func(t *testing.T) {
		values := []p.SamplePair{
			{Value: 1, Timestamp: 1000},
			{Value: 4, Timestamp: 4000},
		}
		value := make(map[query.TimeSeriesQueryType]interface{})
		value[query.RangeQueryType] = p.Matrix{
			&p.SampleStream{
				Metric: p.Metric{"app": "Application", "tag2": "tag2"},
				Values: values,
			},
		}
		query := &query.Query{
			LegendFormat: "",
			Step:         1 * time.Second,
			Start:        time.Unix(1, 0).UTC(),
			End:          time.Unix(4, 0).UTC(),
			UtcOffsetSec: 0,
		}
		res, err := parseTimeSeriesResponse(value, query)

		require.NoError(t, err)
		require.Len(t, res, 1)
		require.Equal(t, res[0].Name, "{app=\"Application\", tag2=\"tag2\"}")
		require.Len(t, res[0].Fields, 2)
		require.Len(t, res[0].Fields[0].Labels, 0)
		require.Equal(t, res[0].Fields[0].Name, "Time")
		require.Len(t, res[0].Fields[1].Labels, 2)
		require.Equal(t, res[0].Fields[1].Labels.String(), "app=Application, tag2=tag2")
		require.Equal(t, res[0].Fields[1].Name, "Value")
		require.Equal(t, res[0].Fields[1].Config.DisplayNameFromDS, "{app=\"Application\", tag2=\"tag2\"}")
	})

	t.Run("matrix response with NaN value should be changed to null", func(t *testing.T) {
		value := make(map[query.TimeSeriesQueryType]interface{})
		value[query.RangeQueryType] = p.Matrix{
			&p.SampleStream{
				Metric: p.Metric{"app": "Application"},
				Values: []p.SamplePair{
					{Value: p.SampleValue(math.NaN()), Timestamp: 1000},
				},
			},
		}
		query := &query.Query{
			LegendFormat: "",
			Step:         1 * time.Second,
			Start:        time.Unix(1, 0).UTC(),
			End:          time.Unix(4, 0).UTC(),
			UtcOffsetSec: 0,
		}
		res, err := parseTimeSeriesResponse(value, query)
		require.NoError(t, err)

		var nilPointer *float64
		require.Equal(t, res[0].Fields[1].Name, "Value")
		require.Equal(t, res[0].Fields[1].At(0), nilPointer)
	})

	t.Run("vector response should be parsed normally", func(t *testing.T) {
		value := make(map[query.TimeSeriesQueryType]interface{})
		value[query.RangeQueryType] = p.Vector{
			&p.Sample{
				Metric:    p.Metric{"app": "Application", "tag2": "tag2"},
				Value:     1,
				Timestamp: 123,
			},
		}
		query := &query.Query{
			LegendFormat: "legend {{app}}",
		}
		res, err := parseTimeSeriesResponse(value, query)
		require.NoError(t, err)

		require.Len(t, res, 1)
		require.Equal(t, res[0].Name, "legend Application")
		require.Len(t, res[0].Fields, 2)
		require.Len(t, res[0].Fields[0].Labels, 0)
		require.Equal(t, res[0].Fields[0].Name, "Time")
		require.Equal(t, res[0].Fields[0].Name, "Time")
		require.Len(t, res[0].Fields[1].Labels, 2)
		require.Equal(t, res[0].Fields[1].Labels.String(), "app=Application, tag2=tag2")
		require.Equal(t, res[0].Fields[1].Name, "Value")
		require.Equal(t, res[0].Fields[1].Config.DisplayNameFromDS, "legend Application")

		// Ensure the timestamps are UTC zoned
		testValue := res[0].Fields[0].At(0)
		require.Equal(t, "UTC", testValue.(time.Time).Location().String())
		require.Equal(t, int64(123), testValue.(time.Time).UnixMilli())
	})

	t.Run("scalar response should be parsed normally", func(t *testing.T) {
		value := make(map[query.TimeSeriesQueryType]interface{})
		value[query.RangeQueryType] = &p.Scalar{
			Value:     1,
			Timestamp: 123,
		}

		query := &query.Query{}
		res, err := parseTimeSeriesResponse(value, query)
		require.NoError(t, err)

		require.Len(t, res, 1)
		require.Equal(t, res[0].Name, "1")
		require.Len(t, res[0].Fields, 2)
		require.Len(t, res[0].Fields[0].Labels, 0)
		require.Equal(t, res[0].Fields[0].Name, "Time")
		require.Equal(t, res[0].Fields[1].Name, "Value")
		require.Equal(t, res[0].Fields[1].Config.DisplayNameFromDS, "1")

		// Ensure the timestamps are UTC zoned
		testValue := res[0].Fields[0].At(0)
		require.Equal(t, "UTC", testValue.(time.Time).Location().String())
		require.Equal(t, int64(123), testValue.(time.Time).UnixMilli())
	})
}

func parseTimeSeriesResponse(value map[query.TimeSeriesQueryType]interface{}, query *query.Query) (data.Frames, error) {
	panic("unimplemented")
}
