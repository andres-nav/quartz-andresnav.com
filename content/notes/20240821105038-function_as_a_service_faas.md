+++
title = "Function as a Service (FaaS)"
author = ["Andrés Navarro Pedregal"]
date = 2024-08-22T00:00:00+02:00
tags = ["cloud"]
draft = false
+++

Category of cloud computing services that provides a platform allowing customers to develop, run, and manage application functionalities without the complexity of building and maintaining the infrastructure.

Building apps with this model is one way of achieving a [serverless]({{< relref "20240818094228-serverless.md" >}}) architecture, and it is typically used when building [microservice]({{< relref "20240821105431-microservices.md" >}}) applications.

Some examples are [AWS Lambda]({{< relref "20240821110408-aws_lambda.md" >}}) (was the first), Google Cloud Functions, Microsoft Azure Functions, [Apache OpenWhisk]({{< relref "20240821105733-apache_openwhisk.md" >}}) (open source), and Oracle Cloud Fn.


## Event-triggered model {#event-triggered-model}

Functions are executed by events and can be composed into complex systems by arranging them into event-driven dataflow graphs.

With their fast starting time and high invocation parallelism, they are suitable to highly burstable loads.

However, functions are expected to be stateless, have limited networking, and limited execution time.
