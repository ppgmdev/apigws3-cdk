#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiS3Stack } from '../lib/cdk-stack';

const app = new cdk.App();
new ApiS3Stack(app, 'ApiS3Stack', {
    env: { region: 'us-east-1' }
});