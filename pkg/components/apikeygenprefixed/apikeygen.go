package apikeygenprefix

import (
	"strings"

	"github.com/grafana/grafana/pkg/util"
	"golang.org/x/crypto/bcrypt"
)

const grafanaPrefix = "gl"

type KeyGenResult struct {
	HashedKey    string
	ClientSecret string
}

type PrefixedKey struct {
	ServiceID string
	Secret    string
	Checksum  string
}

func (p *PrefixedKey) IsValid(hashedKey string) (bool, error) {
	if err := bcrypt.CompareHashAndPassword([]byte(hashedKey), []byte(p.Secret)); err != nil {
		return false, err
	}

	return true, nil
}

func (p *PrefixedKey) String() string {
	return grafanaPrefix + p.ServiceID + "_" + p.Secret + "_" + p.Checksum
}

// encodePassword encodes a password using bcrypt.
func encodeAPIKey(password string) (string, error) {
	key, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", nil
	}

	return string(key), nil
}

func New(serviceID string) (KeyGenResult, error) {
	result := KeyGenResult{}

	secret, err := util.GetRandomString(32)
	if err != nil {
		return result, err
	}

	key := PrefixedKey{ServiceID: serviceID, Secret: secret, Checksum: ""}

	result.HashedKey, err = encodeAPIKey(secret)
	if err != nil {
		return result, err
	}

	result.ClientSecret = key.String()

	return result, nil
}

func Decode(keyString string) (*PrefixedKey, error) {
	key := &PrefixedKey{}
	if !strings.HasPrefix(keyString, grafanaPrefix) {
		return nil, &ErrInvalidApiKey{}
	}

	parts := strings.Split(keyString, "_")
	if len(parts) != 3 {
		return nil, &ErrInvalidApiKey{}
	}

	key.ServiceID = strings.TrimPrefix(parts[0], "gl")
	key.Secret = parts[1]
	key.Checksum = parts[2]

	return key, nil
}
