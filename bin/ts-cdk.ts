#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TsCdkStack } from '../lib/ts-cdk-stack';
import { Tags } from '@aws-cdk/core';

const app = new cdk.App();
const stack = new TsCdkStack(app, 'TsCdkStack');
Tags.of(stack).add('App','DocumentManagement');
Tags.of(stack).add('Enviroment','Develoment');