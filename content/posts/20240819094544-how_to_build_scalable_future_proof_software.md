+++
title = "How to build scalable future-proof software"
author = ["Andrés Navarro"]
date = 2024-02-17T00:00:00+01:00
tags = ["software"]
draft = false
+++

In recent years, **microservices** and **serverless** have been famous topics among software people. Tools like Docker, Kubernetes, or terms like the cloud of **stateless software** have been the standard for developing new software. But what is the reason behind it?


## Problem {#problem}

Usually, traditional software development was based on monolithic applications, characterized by tightly coupled components, posing significant hurdles in terms of scalability, maintainability, and continuous deployment. On the other hand,  the fast-paced and competitive world we live in has made scalable, maintainable, and resilient software a requirement for any business that wants to keep being competitive.


## Solution {#solution}

To develop highly scalable and manageable software, a methodology called 12 Factor App was introduced by Adam Wiggins around 2011. It is based on a ****declarative format, maximum portability, cloud compatibility, continuous deployment, and high scalability****.

The main points for creating scalable and future-proof software are ****loosely coupled software**** where each app is fully enclosed with an ****explicit declaration of dependencies****, configuration as ****environment variables****, use of ****stateless processes**** with no sticky sessions, and high ****disposability****.

However, there are 12 different aspects we must take care and they are:


## 1. Codebase {#1-dot-codebase}

-   A codebase is a group of code in a ****single repository that maps to only one app****. If there are multiple codebases, it is a distributed system of apps.
-   Multiple apps cannot share the same code. ****Group the shared code into libraries**** included with a dependency manager.
-   A deploy is a running instance of the app. There can be variations of the app such as production, staging, dev, etc.


## 2. Dependencies {#2-dot-dependencies}

-   Dependencies must be ****explicitly declared**** and include their versions.
-   The ****system must be isolated****, the app cannot rely on the existence of system-wide packages. All dependencies must have their respective dependencies declared and installed within.
-   Tip: check out [Nix](<https://nixos.org>), it is a great and cool tool to achieve this!


## 3. Config {#3-dot-config}

-   Config is any variable or credential that changes between deploys.
-   Strict separation of config from code, config cannot be hardcoded in code due to constraints.
-   Config must be saved as ****environment variables****, which must be orthogonal and never be grouped together.


## 4. Backing services {#4-dot-backing-services}

-   A backing service is any service that the app consumes as part of its normal operation (over the network or local).
-   Treat backing services as ****attached resources****.
-   There is no distinction between local and third-party services, just attached resources. In a deploy, a backing service must be swappable for other instances of the service.
-   Each distinct backing service is a resource and their connection is managed through environment variables.


## 5. Build, release, run {#5-dot-build-release-run}

-   Stages:
    -   Build stage: convert code into an executable bundle (all dependencies, compiles binaries, and assets).
    -   Release stage: a combination of the build stage with the deploy's config. The resulting **release** is ready for execution in execution env.
    -   Run stage: running app in the execution env.
-   Strictly ****separate build and run stages****.
-   Releases must be ****unique and immutable**** once created, (again check out [Nix](<https://nixos.org>)).
-   Builds are initiated by developers but run-time execution can happen automatically (it must have as few moving parts as possible).


## 6. Processes {#6-dot-processes}

-   An app is executed in the execution environment as one or more processes.
-   Processes are ****stateless and share and store nothing****, with no sticky sessions.
-   Persistent data must be stored in a stateful backing service, or session state data in a data store that offers time-expiration.
-   Memory space and file systems can be temporarily used for brief, single transactions but never for persistent data.


## 7. Port binding {#7-dot-port-binding}

-   Any app is completely ****self-contained****.
-   The app exports a service by ****binding to a port**** and listening to requests.


## 8. Concurrency {#8-dot-concurrency}

-   Use processes to scale the infrastructure.
-   The app must be able to span multiple processes running on multiple physical machines.
-   Using share-nothing, horizontally partition-able apps makes apps easily scalable.
-   Never daemonize or write PID files, ****use the system's process managers****.


## 9. Disposability {#9-dot-disposability}

-   Processes should be ****disposable****, that is they can be started or stopped at a moment's notice.
-   ****Minimize start-up time****.
-   Shut down gracefully when SIGTERM is received.
-   ****Robust against sudden death****.


## 10. Dev/prod parity {#10-dot-dev-prod-parity}

-   Keep development, staging, and production as similar as possible.
-   Make the ****time gap small****: a developer may write code and have it deployed hours or even just minutes later.
-   Make the ****personnel gap small****: developers who wrote code are closely involved in deploying it and watching its behavior in production.
-   Make the ****tools gap small****: keep development and production as similar as possible.


## 11. Logs {#11-dot-logs}

-   Logs are the stream of aggregated, time-ordered events collected from the output streams of all running processes and backing services.
-   Each running process writes its ****event stream, unbuffered, to stdout****.


## 12. Admin processes {#12-dot-admin-processes}

-   One-off admin processes should be run in an identical environment as the regular long-running processes of the app.
-   ****Admin code must ship with application code**** to avoid synchronization issues.
-   Favors languages that provide a REPL shell out of the box.


## Resources {#resources}

-   [12-factor official site](https://12factor.net/)
-   [Wikipedia 12-factor](https://en.wikipedia.org/wiki/Twelve-Factor_App_methodology)
