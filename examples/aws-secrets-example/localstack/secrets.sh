#!/bin/sh

awslocal secretsmanager create-secret \
    --name "my-db-secret" \
    --secret-string "mySuperSecretFromSecretsManager" \
    --region eu-central-1

awslocal ssm put-parameter \
    --name "/secret/db/password" \
    --value "mySuperSecretFromSSM" \
    --type SecureString \
    --region eu-central-1