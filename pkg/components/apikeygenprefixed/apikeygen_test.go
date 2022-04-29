package apikeygenprefix

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestApiKeyValidation(t *testing.T) {
	result := KeyGenResult{
		ClientSecret: "glsa_fDIcPQ79NxLZXvjubEi2P2il3TNIZqkW_00aw2e",
		HashedKey:    "$2a$10$ZL2EAPyGQu7Aqzv9LWDPZ.miTbcY5CtH8w5WDSEn1042HdLpn4Mze",
	}

	keyInfo, err := Decode(result.ClientSecret)
	require.NoError(t, err)
	require.Equal(t, "sa", keyInfo.ServiceID)
	require.Equal(t, "fDIcPQ79NxLZXvjubEi2P2il3TNIZqkW", keyInfo.Secret)
	require.Equal(t, "00aw2e", keyInfo.Checksum)

	valid, err := keyInfo.IsValid(result.HashedKey)
	require.NoError(t, err)
	require.True(t, valid)
}

func TestApiKeyGen(t *testing.T) {
	result, err := New("sa")
	require.NoError(t, err)

	assert.NotEmpty(t, result.ClientSecret)
	assert.NotEmpty(t, result.HashedKey)

	keyInfo, err := Decode(result.ClientSecret)
	require.NoError(t, err)

	valid, err := keyInfo.IsValid(result.HashedKey)
	require.NoError(t, err)
	require.True(t, valid)
}
