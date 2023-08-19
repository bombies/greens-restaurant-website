#!/bin/bash
set -e
IFS='|'

AWSCLOUDFORMATIONCONFIG="{\
\"configLevel\":\"project\",\
\"useProfile\":true,\
\"profileName\":\"default\",\
\"accessKeyId\":\"${AWS_ACCESS_KEY_ID}\",\
\"secretAccessKey\":\"${AWS_SECRET_ACCESS_KEY}\",\
\"region\":\"us-east-1\"\
}"
AMPLIFY="{\
\"projectName\":\"greensrestaurantwebs\",\
\"envName\":\"${AWS_ENV_NAME}\",\
\"defaultEditor\":\"code\"\
}"
FRONTEND="{\
\"frontend\":\"react\"
}"
PROVIDERS="{\
\"awscloudformation\":$AWSCLOUDFORMATIONCONFIG\
}"
CODEGEN="{\
\"generateCode\":true,\
\"codeLanguage\":\"swift\",\
\"fileNamePattern\":\"graphql/**/*.graphql\",\
\"generatedFileName\":\"API.swift\",\
\"generateDocs\":true,\
\"maxDepth\":2\
}"

amplify configure project \
--amplify $AMPLIFY \
--frontend $FRONTEND \
--providers $PROVIDERS \
--yes