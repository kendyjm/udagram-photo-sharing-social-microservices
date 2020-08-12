
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert: string = "MIIDDTCCAfWgAwIBAgIJAhbPyrruQRg8MA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNVBAMTGWRldi11dDZrbXpoei5ldS5hdXRoMC5jb20wHhcNMjAwODEyMDg0MjMyWhcNMzQwNDIxMDg0MjMyWjAkMSIwIAYDVQQDExlkZXYtdXQ2a216aHouZXUuYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8MIIBCgKCAQEAsr5NCpJSrdQ4O9ALJb9gyjjPZq/HN0Tw4EONUaIAr++BqjBtzNXFffT00TvMUQr5A+DW9mp1ecfHdOReRkMHspvFwy6sKqJ/8nYhsqyhx1MNqhpcTu+aROXN1IRmcP6W9vgux9qH8f15ZoZhI7RaDs4UFL9M/oK7A8d7dTD6OFGp/82puUQNpDxGKglyXvv4xbTeVxRRrnpPPutmw9viA+YSxhpNQpdIGXEVUSTT7ARjXFq5YetAHXUWDdq9gF4RouAx24zOwaHghOGqNQSnDNqLDv4b184rhu07vi6Cr1PtU+db//ghHLxhOFszH73FYJgR+TDpUd/+oUBOoC0cDQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSHZzK0FHDySKQUyHhNyGAfDsPsCDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAII0Pg9CL+ynHDjmvU6Au1EFtZCNgqSygn8Ck6ku9warxAhRpdt4URAyU4MhDeHQELfW+FisKWFSmNowfJ/XkM6qAKmAkzLs0LOlENfIrktkV+ciw+MJVDovHD9apEvY2B3uDds6KpvPfYwuGRfq/3ihVqpMTzKDgwAESnUGHvmjaMP2LBTxQUMTZ1MU1NetLjrmcIXzVKlGzSMqi8o28hncdfi3hEQSIt4dBtregTXd1MzJ7Eq2+x42uqIpVAB5P3a21TgztFo3XKVf2Cmb+x88/P/SarR5pnHY941H5aGXz30WUVVm0CuWz0oXjSrTl9Jt+fWe9GnHVyBywCIrs="

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const decodedToken = verifyToken(
      event.authorizationToken,
      cert
    )
    console.log('User was authorized', decodedToken)

    return {
      principalId: decodedToken.sub,
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
    }
  } catch (e) {
    console.log('User was not authorized', e.message)

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
    }
  }
}


function verifyToken(authHeader: string, secret: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(
    token, // Token from an HTTP header to validate
    secret, // A certificate copied from Auth0 website
    { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
  ) as JwtToken
}