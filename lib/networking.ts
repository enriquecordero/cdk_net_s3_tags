import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Subnet, SubnetType, Vpc } from '@aws-cdk/aws-ec2';

export interface NetworkProps {
    maxAzs:number
}


export class Network extends cdk.Construct {

    public readonly vpc:ec2.IVpc

    constructor(scope: cdk.Construct, id: string, props: NetworkProps) {
    super(scope, id);

    this.vpc = new ec2.Vpc(this,'AppVPC',{
        cidr: '10.0.0.0/16',
        maxAzs: props.maxAzs,
        subnetConfiguration:[
            {
                subnetType: ec2.SubnetType.PUBLIC,
                name:'Public',
                cidrMask: 24,
            },
            {
                subnetType: ec2.SubnetType.PRIVATE,
                name:'Private',
                cidrMask: 24,
            },
        ],
    })



    
  }
}
