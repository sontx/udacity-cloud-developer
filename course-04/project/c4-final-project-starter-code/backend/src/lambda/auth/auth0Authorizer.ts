import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';

import { verify } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger';
import { JwtPayload } from '../../auth/JwtPayload';
import { JwtToken } from './JwtToken';

const logger = createLogger('auth');

const cert = `
-----BEGIN CERTIFICATE-----
MIIC/zCCAeegAwIBAgIJIzK7d4ED1RMhMA0GCSqGSIb3DQEBCwUAMB0xGzAZBgNV
BAMTEnRydXllbmF6LmF1dGgwLmNvbTAeFw0xOTAzMTkwMzAxNTBaFw0zMjExMjUw
MzAxNTBaMB0xGzAZBgNVBAMTEnRydXllbmF6LmF1dGgwLmNvbTCCASIwDQYJKoZI
hvcNAQEBBQADggEPADCCAQoCggEBAL2zq/Z3zB85bi+sYdOTMqI4U/o20o7UmZe/
pmH5q4gJJYs+sOwDyCcgAJ5g3PXVXrBGQeO9Ip3SbSrU3e7isZOG+KlD1HQNnMGz
d68pDJhmTUet0zjIooCjiTNrFa8rct/r3qOBoUnSaAJCWStcqxryFqoyxT9E9+b0
PsF2lzKh1hJ/F9PvPJEPQRZC9yaIluu7sdNAzvyrODKdlJ6R6HoZr9klOa6kxbTF
chcr6ZwNkYyI3THPGbA7Qq9SCJx/v+r0W0fMbRvlPvni7OvU/WYo49IPKlGvF1It
Qr153SmuypLCWJWZBuEPuyQsO5wpVguuDFNVa0VIh8DHN3Md6K0CAwEAAaNCMEAw
DwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUfPPeS8dFxaIrGC65iqDQjtET7aEw
DgYDVR0PAQH/BAQDAgKEMA0GCSqGSIb3DQEBCwUAA4IBAQCav+iswVBSbjoPinQV
3km3SDVBsV/CnhI8T4GfXf3Q8HozhnC3glzr12VqgpFyWkz9alSd8Sg0peuqaDNs
mPcO9LtTT6pN+KwACArQFx8EAejR43/YAX+/8wlX3LYhck74Y9jJN9NdJ8CblWoO
xHi8rcVoduEKmlu10efmHlC0ebhbdN8vLFgz18eCy1/Jngm5o/e77yTV0NOUGPb7
i60kzXsSVVppL/3dvMmZktydWit4eEoqEyVpdEUQaw1ID6FeqcFVXzOEQXwbRAnz
gEvI1W0ALX1/eDe9A28uH+QgOQAxqs89Kd6qtJNpm0DhZUXW5EtsZ3VV+dRMRf+B
e+Y0
-----END CERTIFICATE-----`;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info('User was authorized', jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    };
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    };
  }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token;
}
