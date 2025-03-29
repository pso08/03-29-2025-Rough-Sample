/**
 * Glossary API Routes
 * 
 * This file handles retrieving AWS DevOps glossary terms and definitions.
 */

import { NextRequest, NextResponse } from 'next/server';

// AWS DevOps glossary terms
const glossaryTerms = [
  {
    term: 'CloudFormation',
    definition: 'AWS CloudFormation is a service that helps you model and set up your AWS resources so you can spend less time managing those resources and more time focusing on your applications. You create a template that describes all the AWS resources that you want, and CloudFormation takes care of provisioning and configuring those resources for you.',
    url: 'https://aws.amazon.com/cloudformation/'
  },
  {
    term: 'CodePipeline',
    definition: 'AWS CodePipeline is a fully managed continuous delivery service that helps you automate your release pipelines for fast and reliable application and infrastructure updates. You can model the complete release process for building your code, deploying to pre-production environments, testing your application, and releasing it to production.',
    url: 'https://aws.amazon.com/codepipeline/'
  },
  {
    term: 'CodeBuild',
    definition: 'AWS CodeBuild is a fully managed build service that compiles source code, runs tests, and produces software packages that are ready to deploy. With CodeBuild, you don\'t need to provision, manage, and scale your own build servers.',
    url: 'https://aws.amazon.com/codebuild/'
  },
  {
    term: 'CodeDeploy',
    definition: 'AWS CodeDeploy is a service that automates code deployments to any instance, including Amazon EC2 instances and instances running on-premises. CodeDeploy makes it easier for you to rapidly release new features, helps you avoid downtime during application deployment, and handles the complexity of updating your applications.',
    url: 'https://aws.amazon.com/codedeploy/'
  },
  {
    term: 'CodeCommit',
    definition: 'AWS CodeCommit is a fully-managed source control service that hosts secure Git-based repositories. It makes it easy for teams to collaborate on code in a secure and highly scalable ecosystem.',
    url: 'https://aws.amazon.com/codecommit/'
  },
  {
    term: 'Elastic Beanstalk',
    definition: 'AWS Elastic Beanstalk is an easy-to-use service for deploying and scaling web applications and services. You can simply upload your code and Elastic Beanstalk automatically handles the deployment, from capacity provisioning, load balancing, auto-scaling to application health monitoring.',
    url: 'https://aws.amazon.com/elasticbeanstalk/'
  },
  {
    term: 'CloudWatch',
    definition: 'Amazon CloudWatch is a monitoring and observability service that provides data and actionable insights to monitor your applications, respond to system-wide performance changes, optimize resource utilization, and get a unified view of operational health.',
    url: 'https://aws.amazon.com/cloudwatch/'
  },
  {
    term: 'Auto Scaling',
    definition: 'AWS Auto Scaling monitors your applications and automatically adjusts capacity to maintain steady, predictable performance at the lowest possible cost. Using AWS Auto Scaling, it\'s easy to set up application scaling for multiple resources across multiple services in minutes.',
    url: 'https://aws.amazon.com/autoscaling/'
  },
  {
    term: 'Infrastructure as Code (IaC)',
    definition: 'Infrastructure as Code is the practice of managing and provisioning infrastructure through machine-readable definition files, rather than physical hardware configuration or interactive configuration tools. AWS CloudFormation and AWS CDK are examples of IaC tools.',
    url: 'https://aws.amazon.com/devops/what-is-devops/'
  },
  {
    term: 'Continuous Integration (CI)',
    definition: 'Continuous Integration is a software development practice where developers regularly merge their code changes into a central repository, after which automated builds and tests are run. The key goals of CI are to find and address bugs quicker, improve software quality, and reduce the time it takes to validate and release new software updates.',
    url: 'https://aws.amazon.com/devops/continuous-integration/'
  },
  {
    term: 'Continuous Delivery (CD)',
    definition: 'Continuous Delivery is a software development practice where code changes are automatically built, tested, and prepared for a release to production. It expands upon continuous integration by deploying all code changes to a testing environment and/or a production environment after the build stage.',
    url: 'https://aws.amazon.com/devops/continuous-delivery/'
  },
  {
    term: 'Blue/Green Deployment',
    definition: 'Blue/Green deployment is a technique that reduces downtime and risk by running two identical production environments called Blue and Green. At any time, only one of the environments is live, with the live environment serving all production traffic. When you want to update your application, you do your final testing in the non-live environment, then switch the traffic to it.',
    url: 'https://aws.amazon.com/blogs/devops/blue-green-deployments-with-aws-codedeploy-and-aws-cloudformation/'
  },
  {
    term: 'Canary Deployment',
    definition: 'Canary deployment is a technique to reduce the risk of introducing a new software version in production by slowly rolling out the change to a small subset of users before rolling it out to the entire infrastructure and making it available to everybody.',
    url: 'https://aws.amazon.com/blogs/devops/automating-canary-deployments/'
  },
  {
    term: 'Systems Manager',
    definition: 'AWS Systems Manager is a management service that helps you automatically collect software inventory, apply OS patches, create system images, and configure Windows and Linux operating systems. It allows you to securely manage your instances at scale without having to log in to your servers.',
    url: 'https://aws.amazon.com/systems-manager/'
  },
  {
    term: 'OpsWorks',
    definition: 'AWS OpsWorks is a configuration management service that provides managed instances of Chef and Puppet. It lets you use code to automate the configurations of your servers.',
    url: 'https://aws.amazon.com/opsworks/'
  }
];

// Get all glossary terms or a specific term
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term');
    
    if (term) {
      // Find the specific term (case-insensitive)
      const termData = glossaryTerms.find(
        item => item.term.toLowerCase() === term.toLowerCase()
      );
      
      if (!termData) {
        return NextResponse.json(
          { error: 'Term not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(termData);
    } else {
      // Return all terms
      return NextResponse.json({
        terms: glossaryTerms
      });
    }
    
  } catch (error) {
    console.error('Error fetching glossary terms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch glossary terms' },
      { status: 500 }
    );
  }
}
