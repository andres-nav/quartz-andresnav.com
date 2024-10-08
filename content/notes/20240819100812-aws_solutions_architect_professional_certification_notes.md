+++
title = "AWS Solutions Architect Professional Certification Notes"
author = ["Andrés Navarro Pedregal"]
date = 2024-02-27T00:00:00+01:00
tags = ["cloud"]
draft = false
+++

**IMPORTANT:** Latest update <span class="timestamp-wrapper"><span class="timestamp">&lt;2024-02-27 Tue&gt;</span></span>. This notes might be not up to date. Check with AWS Docs.


## Compute {#compute}


### EC2 {#ec2}

Linux, Windows, or Mac based virtual server which sues the Nitro System.

-   Instance states: start, stop, hibernate, terminate
    -   Instance stop protection: prevent instances from being accidentally stopped.


#### Instance Store {#instance-store}

Internal block storage of a EC2 instance.

-   **IMPORTANT:** Its lifecycle is attached to that instance. If EC2 is terminated, then the data is gone (ephemeral storage).
-   **IMPORTANT:** You can only create AMI from the AMI Tools CLI using the "ec2-bundle-vol".
-   **IMPORTANT:** Cannot create snapshots from instance store volumes.

-   Really high performance and more IOPS compared to EBS volumes.
-   Use cases: temporal info, buffers, caches, scratch data, and data that is replicated across a fleet of instances.
-   Attached at launch time (can add more than 1), cannot add after it is launched.
-   Included in the instance price.

-   Data is lost if:
    -   The underlying disk drive fails
    -   The instance stops
    -   The instance hibernates
    -   The instance terminates
    -   The EC2 host is in maintenance


#### AMI &amp; Instance Building {#ami-and-instance-building}

Bundle that contains a template for the root volume and launch permissions.

-   **IMPORTANT:** In the AWS Console create image page, only amazon EBS-backed linux AMIs can be created.
    -   To create an instance store backed AMI, use EC2 AMI tools and upload the manifest to S3,
        -   Then <span class="underline">EC2 register-image</span> can register the AMI with the manifest in S3.

-   Backed by Amazon EBS: root device for an instance launched from the AMI is an Amazon EBS volume. Can use EBS encryption. max size 64TiB.
    -   To launch an encrypted EBS-backed EC2 instance from an unencrypted AMI, first create an encrypted copy of the AMI.

-   Backed by Instance Store: root device for an instance launched from the AMI is an instance store volume created from a template stored in S3. Max size 10GiB.

-   Can copy AMIs to different regions.
-   Recycle Bin: an restore deleted AMIs using recycle bin.
-   Can set lock retention rules to protect against modifications and deletions.

<!--list-separator-->

-  Image Builder

    Fully managed service to automate the creation, management, and deployment of AMIs.

    -   Can configure pipelines to automate updates as well as system patching for the images.

<!--list-separator-->

-  Building and Customization

    -   Bootstrapping: launch state script executed with Cloud Init (slow but flexible).

    -   AMI Baking: launch an instance, configure everything, and then create an AMI from that instance. (quick but not flexible).

    -   Combination: combine both.


#### Networking {#networking}

-   **IMPORTANT:** Security Groups are attached to ENIs not to EC2.
-   **IMPORTANT:** Every EC2 instance is linked to a primary ENI (eth0) which cannot be removed with an private IPv4 address that never changes.
    -   Additional ENIs can be added from other subnets (multi homed) but they must be in the same AZ (number depends on the instance size).
    -   1 public IPv4 address can be attached to an ENI which is allocated to the instance but not visible to the OS. IP traffic is translated by the IGW when it leaves and arrived to the VPC.

-   Elastic IP addresses are used for static public IP addresses and allocated per private IPv4 addresses.
    -   If associated to the instance or the primary ENI, the dynamically allocated public IP is lost forever and the elastic IP is used.
    -   Limited to 5 addresses per region per account.

-   IPv6 addresses are publicly routable and visible by the OS.

-   An EIN (Elastic Network Interface) is a logical networking component in a VPC that represents a virtual network card.
-   Each ENI has a MAC address used for identification and licensing.

-   Each ENI has a flag that checks the source and destination. If it is not the source or destination it is dropped.
    -   Disabling this allows ENIs to process packets it has not created or it is not the destination. Used for NAT.
    -   It is configured in the primary ENI of each instance.

<!--list-separator-->

-  Enhanced Networking

    Provides higher bandwidth, higher packet per second (PPS) performance, and consistent lower inter-instance latencies, which are being used in Placement Groups.

    -   Lower CPU utilization when compared to traditional virtualized network interfaces.

<!--list-separator-->

-  EFA (Elastic Fabric Adapter)

    Network device that you can attach to accelerate High Performance Computing (HPC) and ML app.

    -   Enables to achieve the app performance of an on-premises HPC cluster, with the scalability, flexibility, and elasticity provided by the AWS Cloud.


#### Placement Groups {#placement-groups}

Determines how instances are placed on underlying hardware.

-   Cluster: clusters instances into a low-latency group in a single AZ.
    -   Launch all instances at the same time to ensure AWS allocates the required capacity.
    -   Best practice: use the same type of instance
    -   Used for low network latency, high network throughput, and if the majority of the network traffic is between the instances in the group.

-   Spread: spreads instances across underlying hardware which can span multiple AZs.
    -   Maximum of 7 running instances per AZ per group.
    -   Used for small number of critical instances that need to be kept separated from each other.

-   Partition: groups of instances spread apart to reduce the likelihood of correlated failures for large distributed and replicated workloads.
    -   Maximum of 7 running instances per AZ per partition.
    -   Also used when you  need the spread groups features but have more than 7 instances per AZ.

{{< figure src="./img/ec2_placement_groups_partition.png" >}}

<!--list-separator-->

-  Instance Tenancy

    How EC2 instances are distributed across physical hardware and affects pricing.

    -   Shared (default): multiple AWS accounts may share the same physical hardware.
    -   Dedicated Instance (dedicated): instance runs on single-tenant hardware.
    -   Dedicated Host (host): instance runs on a physical server with EC2 instance capacity fully dedicated to your use, an isolated server with configurations that you can control.

    {{< figure src="./img/ec2_instance_tenancy.png" >}}

<!--list-separator-->

-  Changing Instances

    -   **IMPORTANT:** Before an instance is moved or removed, the instance must be in the stopped state.
        -   It can be done using the AWS CLI or an AWS SDK.

    Change the placement group for an instance in any of the following ways:

    -   Move an existing instance to a placement group
    -   Move an instance from one placement group to another
    -   Remove an instance from a placement group


#### Auto Scaling Groups {#auto-scaling-groups}

-   **IMPORTANT:** For unhealthy instances, first it terminates it and then it launches a new instance to replace the failed instance (can be changed).
-   **IMPORTANT:** For rebalancing AZs, first it launches new instances before terminating the old ones. No compromise on performance or availability.
-   **IMPORTANT:** Launch templates cannot be modified you need to create a new one. ASG drops the oldest LT instances by default.
-   **IMPORTANT:** Use Spot Fleet to increase the chances that the spot request can be fulfilled.
-   **IMPORTANT:** To debug failing instances in a ASG, suspend the "Terminate" process for the ASG, and the connect via System Manager Session Manager.

-   Keeps the number of instances the same for every subnet.
-   Cool-down period: minimum time the ASG waits to perform a new action when an action is performed
-   Instance protection: prevent specific instances from being terminated during automatic scale in.

<!--list-separator-->

-  Lifecycle Hooks

    Custom actions on instances during ASG actions (instance launch or instance terminate).

    -   Used with EventBridge or SNS notifications.
    -   Instances are paused withing the flow (wait)
        -   Until timeout (continue or abandon)
        -   Or resume the ASG process CompleteLifecycleAction

    {{< figure src="./img/ec2_asg_lifecylce_hooks.png" >}}


#### HPC with EC2 instances {#hpc-with-ec2-instances}

-   **IMPORTANT:** Usually EC2 instances with burtable performance don't improve network performance in a HPC cluster.

-   Disable CPU hyperthreading
-   Run the HPC cluster within a single AZ
-   Use EC2 instance types that supports EFA.


#### Pricing {#pricing}

-   On-Demand: multiple customer instances on shared hardware with per-second billing.
    -   It is the default, no interruption, no capacity reservation, predictable pricing, no upfront cost nor discount.
    -   Used for short term and unknown workloads and apps which can't be interrupted.

-   Spot: unused capacity for a discounted price up to 5x less.
    -   Instance termination if your max prices is lower than the spot price.
    -   Used for non time critical, or anything which can be rerun, bursty capacity needs, cost sensitive workloads, stateless.

-   Reserved: long term reserved instances with periods of 1 or 3 years.
    -   **IMPORTANT:** To use multiple RI, all the parameters must be the same (type, size, AZ, etc.).
    -   Can be no upfront (some saving), all upfront (no per second free), partial upfront (reduced fee)
    -   Used for services with known usage, consistent access to compute and required for a long term usage that cannot tolerate any interruption.

-   Scheduled Reservation: long term reserved instances with a scheduled period with frequency, duration, and time.
    -   Used for batch processing, data analysis
    -   Does not support all instances types and regions.

-   Capacity Reservation: used for capacity reservation without discounts.
    -   Regional reservation, zonal (in a specific AZ), or on demand

-   Dedicated Host: pay for the host itself, no instance charges
    -   Used for licensed on sockets/cores mainly.

-   Dedicated Instances: run workloads on independent instances.
    -   Used for legal reasons that you don't share resources with other people

-   Savings Plan
    -   Hourly commitment for 1 or 3 year term.
    -   General compute savings plans for EC2, Fargate &amp; lambda (cost effective access to migration to serverless).
    -   EC2 savings plan.
    -   Commit to an hourly commitment and pay that price up to that use, after that pay on-demand.


#### Extra {#extra}

-   To backup a copy of the data, create a snapshot of an EBS volume, which is stored in S3.
    -   An EBS volume can be created from a snapshot, and attached to another instance.

-   Can configure EC2 instances as bastion hosts (aka jump boxes) in order to access VPC instances for management, using SSH or RDP protocols.

-   Naming conventions a1.large or t3.medium
    -   First position: instance family, g are for graphics specialized
    -   Second position: generation
    -   Remaining letters before period. attributes such as n for nvme
    -   After the period: instance size


### ECR {#ecr}

A regional managed Docker registry service.

-   Stores container images in S3.


### ECS {#ecs}

Container management service to run, stop and manage Docker containers on a cluster.

-   **IMPORTANT:** Tasks can have an IAM role associated with them. The permissions granted in the IAM role are assumed by the containers running in the task.
-   **IMPORTANT:** When using an IAM role with tasks running on EC2 instances, the containers can use the credentials that are supplied to the EC2 instance profile.

-   Used for consistent deployment and build experiences, manage, and scale batch and ETL workloads, and build sophisticated app architectures on a microservices model.
-   Can mount Amazon Elastic File System (EFS) file systems.


#### Components {#components}

-   Container definition: where it describes the type of image and where is located, ports, etc.
-   Task definition: group of container definitions.
    -   Tasks roles: iam role that the task can assume to interact with aws resources (best practice)
-   Service Definition: defines the service, how does the task scale, number of copies, restarts, ELB, etc.
-   Cluster: logical grouping of resources run within a region.
    -   Can contain tasks from Fargate and EC2.
    -   Before a cluster can be deleted, you must delete the services and deregister the container instances inside that cluster.

{{< figure src="./img/ecs_structure.png" >}}


#### Launch Types {#launch-types}

<!--list-separator-->

-  EC2

    Run containers in EC2 instances where you manage them, and scales via ASGs.

    -   **IMPORTANT:** ECR private repositories are only supported by the EC2 Launch Type.
    -   **IMPORTANT:** When using Spot instances, ECS supports <span class="underline">Automated Draining</span> to reduce the service interruptions due to spot termination.
        -   Spot instances will be in a "draining" state upon the receipt of a 2 minute interruption notice, and ECS tasks will be trigger to shutdown and replacement tasks will be scheduled elsewhere on the cluster.

    -   Runs withing a region and VPC and can be distributed among AZs.
    -   Spot pricing can be used
    -   Container Agent: sends information about the resource's current running tasks and resource utilization to ECS.

    {{< figure src="./img/ecs_mode_ec2.png" >}}

<!--list-separator-->

-  Fargate

    ECS can be run on Fargate mode but the following considerations must be met:

    -   Task definitions require that the <span class="underline">network mode is awsvpc</span>.
    -   Task definitions require to specify CPU and memory at the task level.
    -   Task definitions only support the awslogs log driver for the log configuration. Send logs to CW logs.
    -   Task storage is ephemeral.


#### Task Networking Type {#task-networking-type}

-   awsvpc (linux/windows): allocated its own ENI and a primary private IPv4 address. Same networking properties as EC2 instances.
    -   Don't support CLBs. Must use NLB for TCP instead.
    -   <span class="underline">Mandatory if Fargate is used</span>.
-   bridge (linux default): uses Docker's built-in virtual network on Linux. The built-in virtual network on Linux uses the bridge Docker network driver.
-   host (linux): uses the host's network which bypasses Docker's built-in virtual network by mapping container ports directly to the ENI of the EC2 instance.
    -   Dynamic port mappings can't be used.
    -   A container in a task definition must specify a specific hostPort number.
    -   A port number on a host can't be used by multiple tasks. Can't run multiple tasks of the same task definition on a single EC2 instance.
-   none (linux): has no external network connectivity.
-   default (windows default): uses Docker's built-in virtual network on Windows, which runs inside each EC2 instance that hosts the task. The built-in virtual network on Windows uses the nat Docker network driver.


#### Deployment Strategies {#deployment-strategies}

-   Rolling Update: service scheduler replacing the currently running version of the container with the latest version.

-   Blue/Green Deployment with AWS CodeDeploy: allows to verify a new deployment of a service before sending production traffic to it.
    -   Must be configured to use either an ALB or NLB.


#### ECS Anywhere {#ecs-anywhere}

Run containers on your on-premises infrastructure.


#### Pricing {#pricing}

-   With Fargate, pay for the amount of vCPU and memory from the time images are pulled until task terminates.
-   For the EC2 launch type. pay for AWS resources (e.g. EC2 instances or EBS volumes).


#### Extra {#extra}

-   Support the ALB, NLB, and CLB.

-   Put multiple containers in the same task definition if:
    -   Containers share a common lifecycle.
    -   Containers are required to be run on the same underlying host.
    -   You want your containers to share resources.
    -   Your containers share data volumes.
-   Otherwise, define your containers in separate task definitions so that you can scale, provision, and de-provision them separately.


### EKS {#eks}

Managed open source container orchestration system used to automate the deployment, scaling, and management of containerized applications with Kubernetes

-   Can be run in AWS, Outposts, EKS Anywhere, EKS Distro
-   Supports auto scaling with cluster autoscaler (AWS auto scaling groups) or Karpenter.
-   No logs sent to CW logs by default, enabled per type basis.
-   Services run in pods should be stateless as they are temporary.
-   Storage Providers: EBS, EFS, FSx Lustre, FSx for NetApp ONTAP


#### Compontents {#compontents}

-   Cluster: architecture of EKS composed of a control plane and nodes.
-   Control Plane: manages the cluster, scheduling, applications, scaling, and deploying of tasks.
    -   Deployed in multiple AZs fronted by a NLB.
-   Nodes: VM or physical server which function as a worker (run pods)
    -   There can be self-managed node groups, managed node groups (automatic), or Fargate.
-   Pods: smallest units of computing in Kubernetes (temporary) which can contain 1 or more containers.
    -   Vertical and horizontal scaling.

-   Ingress: exposes a way into a service (external resource interact with services) (ingress-&gt;routing-&gt;service-&gt;pods)
-   Ingress controller: controls the hardware to allow the ingress (AWS LB controller uses ALB/NLB)

-   Connector: register and connect any Kubernetes cluster to AWS (for external Kubernetes clusters).

{{< figure src="./img/kubernetes_cluster.png" >}}

{{< figure src="./img/kubernetes_cluster_details.png" >}}


#### Networking {#networking}

-   Private subnets: 3 private subnets distributed across different AZs.
    -   Internet traffic via a NAT instance or NAT gateway.
    -   Cluster endpoint  only accessible via VPC. Traffic from worker nodes to the endpoint will go within your VPC.

-   Public subnets: 3 public subnets distributed across different AZs.
    -   Nodes are assigned public IPv4 addresses and can send and receive internet traffic via an IGW.
    -   Cluster endpoint accessible from outside your VPC.Traffic from worker nodes to the endpoint will go through the internet.

-   Public and private subnets: each AZ has one private and public subnet.
    -   Nodes are deployed to private subnets.
    -   Load balancers are assigned to public subnets to load balance traffic to pods running on nodes.
    -   Public IPv4 addresses automatically assigned to nodes in public subnets.
    -   IPv6 addresses can be assigned to nodes in both public and private subnets.
    -   A NAT gateway (IPv4) or an egress-only Internet gateway (IPv6) can be used to allow pods to communicate outbound to the internet.
    -   The cluster endpoint can be accessed from outside your VPC. Traffic from worker nodes to the endpoint will remain within your VPC.

-   Use AWS PrivateLink to privately access the management APIs of Amazon EKS from within the VPC.

{{< figure src="./img/eks_architecture.png" >}}


#### EKS Anywhere {#eks-anywhere}

Deploy your containers on-premises. Works like Amazon ECS Anywhere

-   Use on-premises equipment while maintaining official support from AWS.


#### EKS Distro {#eks-distro}

Open-source option for EKS Anywhere without AWS support.


#### Fargate {#fargate}

EKS can be run on Fargate mode but the following considerations must be met:

-   Define a Fargate profile before scheduling pods on Fargate in the cluster.
-   If a pod matches more than one Fargate profile, EKS picks one at random.
-   Fargate profiles are immutable and contain the following components:
    -   Pod execution role
    -   Subnets
    -   Selectors
    -   Namespace
    -   Labels
-   Fargate runs only one pod per node.
-   Pod storage is ephemeral, and data is encrypted with Fargate managed keys.


### Fargate {#fargate}

Serverless compute engine for containers for ECS and EKS.

-   **IMPORTANT:** To mount an Amazon EFS file system on a Fargate task or container, you must first create a task definition.
    -   Then, make that task definition available to the containers in the task across all AZ in the Region.
    -   Then, the Fargate tasks use EFS to automatically mount the file system to the tasks that you specify in the task definition.

-   In ECS, awsvpc network mode must be used.
-   Used for large workloads, for overhead conscious, small and burst workloads, or batch and periodic workloads
-   Task storage is ephemeral.
-   ECS Exec is used to execute commands on running containers.
-   10 GB of Docker layer storage with an additional 4 GB for volume mounts.


### Batch {#batch}

Managed compute service used for large scale data analytics and processing.

-   Run EC2 instances in a region across AZs.
-   Retry strategy to automatically retry failed jobs.
-   Timeout duration so that if a job runs longer than that, Batch terminates the job.
    -   If a job is terminated for exceeding the timeout duration, it is not retried.
-   Used by batch processing, jobs that can run without end user interaction or can be scheduled to run as resources permit in replacement of Lambda:
    -   Jobs that run longer than 15 min
    -   Jobs that need large disk space
    -   Jobs that need any runtime

{{< figure src="./img/aws_batch.png" >}}


#### Jobs {#jobs}

A unit of work (such as a shell script, a Linux executable, or a Docker container image)

-   Jobs can reference other jobs and can be dependent on the successful completion of other jobs.
-   Types:
    -   Single
    -   Array: runs as a collection of related, yet separate, basic jobs that may be distributed across multiple hosts and may run concurrently.

-   Multi-node parallel: run single large-scale, tightly coupled, high-performance computing applications and distributed GPU model training jobs that span multiple Amazon EC2 instances.
    -   Spot Instances no supported

<!--list-separator-->

-  Job Queues

    Place where a Batch job resides until it is scheduled onto a computing environment.

    -   Can associate one or more compute environments with a job queue.
    -   Can assign priority values for the compute environments and even across job queues themselves.

    -   The Batch Scheduler evaluates when, where, and how to run jobs that have been submitted to a job queue.


#### Compute Environment {#compute-environment}

-   Managed: Batch manages the capacity and instance types of the compute resources within the environment based on workload needs.
    -   Can be run on Fargate. Not recommended form workloads with more than 16vCPU, GPU, custom AMI.
    -   Can choose to use On-Demand Instances or Spot Instances.
    -   Instances are launched into the VPC and subnets that you specify (can be public or private).
        -   Require VPC gateways.

-   Unmanaged: use your own compute environment such as ECS
    -   You managed everything and tightly control the pricing.


### Lambda {#lambda}

Serverless function-as-a-service used for short running &amp; focused stateless tasks.

-   **IMPORTANT:** It does not support Docker but it supports container images.
-   **IMPORTANT:** Can mount an EFS file system to a local directory.
-   **IMPORTANT:** Run up to 15mins.
-   **IMPORTANT:** Use Lambda Function URLs to simplify the admin overhead. You can use webhook with those endpoints.

-   Supports Node.js, Java, C#, Go, Python, Ruby, PowerShell, and custom runtimes (such as Rust with lambda layers).
-   Has resource policies to control who can invoke the function.
-   Billed for the duration of the function execution.

{{< figure src="./img/lambda.png" >}}


#### Components {#components}

-   Function: script or program that runs in Lambda. Passes invocation events which are processed and returns a response.

-   Execution environment: secure, isolated micro virtual machine where a Lambda function is executed.

-   Runtimes: allows functions in different languages to run in the same base execution environment.

-   Layers: ZIP archive to distribute libraries, custom runtimes, and other function dependencies.
    -   Allows the managed of in-development function code independently from the unchanging code and resources that it uses.
    -   Keep development package small.

-   Event source: an AWS service or a custom service that triggers a Lambda function and executes its logic.

-   Downstream resources: AWS service that Lambda function calls once it is triggered.

-   Log streams: annotate function code with custom logging statements to analyze the execution flow and performance.


#### Functions {#functions}

-   Application code can be uploaded as a ZIP file or a container image hosted on ECR.
-   To create function, you first package code and dependencies in a deployment package. Then, upload the deployment package to create your Lambda function.
-   After the function is in production, Lambda automatically monitors functions on your behalf, reporting metrics through CloudWatch.
-   Basic function settings: description, memory usage (1vCPU per 1769MB), storage (512MB – 10GB), execution timeout (15 minutes max), and execution IAM role.
-   Environment variables are always encrypted at rest with KMS and can be encrypted in transit as well.

-   Versions: snapshot of function's state at a given time (immutable once published with a unique ARN).
    -   $Latest points to the latest version.

-   Aliases: pointer to a Lambda function version.
    -   Alias routing: allows to set a percentage of traffic to different lambda versions.
        -   Useful to test new features and beta testing.
        -   **IMPORTANT:** They need to have the same execution role, dead-letter queue and cannot be $LATEST.

<!--list-separator-->

-  INVOKING LAMBDA FUNCTIONS

    -   Synchronous invocation: Lambda waits until the function is done processing, then returns the result.

        -   Examples: API Gateway ALB, Cognito, Kinesis Data Firehose, CloudFront (Lambda@Edge).

        {{< figure src="./img/lambda_invokation_synchronous.png" >}}

    -   Asynchronous invocation: Lambda stores the event in an internal queue and handles the invocation.

        -   Returns a 202 status code immediately after being invoked, and the processing continues in the background.
        -   Used for long-latency processes that run in the background, such as batch operations, video encoding, and order processing.
        -   <span class="underline">Can only accept a payload of up to 256 KB</span>.
        -   **Function code needs to be idempotent**.
        -   If the function fails, it will retry between 0 and 2 times (configurable).
            -   Events can be sent to a dead letter queue after repeated failures in processing.
        -   Examples: S3, CW Logs, EventBridge, CodeCommit, CloudFormation, Config, API Gateway (by specifying Event in the X-Amz-Invocation-Type request header of a non-proxy integration).

        {{< figure src="./img/lambda_invokation_asynchronous.png" >}}


#### Concurrency &amp; Lifecycle {#concurrency-and-lifecycle}

Lambda code runs inside a Execution Context which is created

-   **IMPORTANT:** The burst concurrency is between 500-3k requests per second (depending on region).

-   Cold start: when a full creation and configuration of performed including function code downloads.
-   Warm start: for future lambda invocations when a previous execution context already exists.
    -   Provisioned concurrency: keep a number of execution contexts alive.
        -   Used to enable to scale without fluctuations in latency.

-   Concurrency: number of instances that serve requests at a given time.
-   Reserved concurrency is used to ensure that it can always reach that level of concurrency. No other function can use that concurrency.

{{< figure src="./img/lambda_start_up.png" >}}

{{< figure src="./img/lambda_lifecycles.png" >}}


#### Networking {#networking}

-   Public (default):

    -   Can access the public internet and AWS public services.
    -   Best performance as no customer specific VPC networking is required.
    -   Not access to VPC based services unless public IPs are provided and security controls allow external access.

    {{< figure src="./img/lambda_networking_public.png" >}}

-   Private:

    -   Run in a AWS Lambda Service VPC, and creates a ENI in the selected VPC for every unique combinations of SG and subnets.
    -   Obey all VPC networking rules.
    -   Needs EC2 network permissions, created when the lambda function is created or updated.
    -   Not exposed to the public internet

    {{< figure src="./img/lambda_networking_private.png" >}}


#### Event Source Mapping {#event-source-mapping}

Lambda resource that reads from a queue or stream and synchronously invokes a Lambda function.

-   Event-filtering pattern can be used to process events that only match a specific filter.
-   Invokes a function if one of the following conditions is met:
    -   The batch size is reached
    -   The maximum batching window is reached
    -   The total payload is 6 MB
-   It is provided for the following services: Kinesis, DynamoDB, SQS, MQ, Managed Streaming and Self-managed for Apache Kafka.
-   SQS Queues and SNS topics can be used for any discarded failed event batches.

{{< figure src="./img/lambda_invokation_event_source_mapping.png" >}}


#### Lambda@Edge {#lambda-edge}

Run Lambda functions to customize content that CloudFront delivers, executing the functions in AWS locations closer to the viewer.

-   **IMPORTANT:** Can serve only up to 10k requests per second.

-   Supports only Node.js and Python.
-   Runs on AWS public space, not VPC.
-   Lambda layers are not supported.
-   Can change CloudFront request and responses when: after requests or responses are received or before requests or responses sent.
-   Used for A/B testing, gradual migration between S3 origins, different objects based on device, content by country.
-   Different limits: customer side as 128MB and 5s, origin side as normal lambda MB and 30s.

{{< figure src="./img/cloudfront_lambda_edge.png" >}}


#### Integrations with API Gateway {#integrations-with-api-gateway}

-   Lambda Proxy integration: request sent directly form the client to the lambda function without modifications.

-   Lambda non-proxy integration: request can be modified before sending it to the lambda function


#### Extra {#extra}

-   Build containers with lambda functions, need to add the Lambda Runtime API.
-   To do local testing you can use the Lambda Runtime Interface Emulator (RIE).

-   SnapStart speeds up Java applications by reusing a single initialized snapshot to quickly resume multiple execution environments.
    -   Used to decrease the cold start time required without provisioning additional resources.


### Elastic Beanstalk {#elastic-beanstalk}

Platform as a service where you only provide the code and the infrastructure is handled by AWS.

-   Supports Go, Java, .NET, Node.js, PHP, Python, Ruby, Tomcat, Passenger, Puma, Docker, or custom via Packer.
-   Useful for small development teams
-   Databases should be outside of Elastic Beanstalk, DBs in an env that is deleted is lost.

{{< figure src="./img/elastic_beanstalk.png" >}}


#### Components {#components}

-   Application: logical collection of components, including environments, versions, and environment configurations.
-   Application Version: specific, unique, labeled iteration of deployable code for a web application. Points to an Amazon S3 object that contains the deployable code.
-   Environment: version that is deployed on to AWS resources. Each environment runs only a single application version at a time.
    -   Can be web server tier (for end user communication) and work tier (to process the web server tier).
    -   Each environment has a specific CNAME.
-   Environment Configuration: collection of parameters and settings that define how an environment and its associated resources behave.

-   Environment Types:
    -   Load-balancing, Autoscaling Environment: automatically starts additional instances to accommodate increasing load on your application.
    -   Single-Instance Environment: contains one Amazon EC2 instance with an Elastic IP address.

-   Application version lifecycle policy can be used to delete application versions that are old or to delete application versions when the total number of versions for an application exceeds a specified number.


#### Deployment Policies {#deployment-policies}

-   All at once: deploys the new version to all instances simultaneously.

    -   Brief outage, and bad at handling failures.
    -   Useful for dev environments.

    {{< figure src="./img/elastic_beanstalk_deployment_all_at_once.png" >}}

-   Rolling: deploys the new version in batches. Each batch is taken out of service, updated, tested and then put back into service.

    -   Safer but it loses capacity.
    -   No increasing costs.

    {{< figure src="./img/elastic_beanstalk_deployment_rolling.png" >}}

-   Rolling with additional batch: deploys the new version in batches, but first launch a new batch of instances.

    -   No losses in capacity but additional costs
    -   Better for real environments with real load

    {{< figure src="./img/elastic_beanstalk_deployment_rolling_with_additional_batch.png" >}}

-   Immutable: deploys the new version to a new set of instances.

    -   Once they pass the health checks, all instances are moved to the other ASG and the temp AGS is deleted

    {{< figure src="./img/elastic_beanstalk_deployment_immutable.png" >}}

-   Traffic Splitting: deploys the new version to a new set of instances and temporarily splits incoming client traffic.

    -   Can perform A/B testing with the new app version.
    -   Can go back if errors.
    -   No capacity drops, almost risk free, additional testing capability, but additional cost.

    {{< figure src="./img/elastic_beanstalk_deployment_traffic_splitting.png" >}}


#### Integration with RDS {#integration-with-rds}

-   Create an RD instance withing the EB env (not recommended).
    -   If the EB env all data is lost
    -   Different env have diff rds with diff data
    -   Used for small scale testing and dev

-   Create RDS instance outside the EB env
    -   You need to provide the env variables to point to the RDS instance
        RDS_HOSTNAME, RDS_PORT, RDS_DB_NAME, RDS_USERNAME, RDS_PASSWORD

-   How to decouple RDS withing EB from a EB env:
    1.  Create RDS Snapshot
    2.  Enable delete protection
    3.  Create new EB env with the same app version
    4.  Ensure new env can connect to the DB
    5.  Swap environments
    6.  Terminate the old environment
    7.  Manually delete the DELETE_FAILED stack in CF, and choose to retain stuck resources


#### HTTPS {#https}

-   Apply the SSL cert to the load balancer.
-   Make sure you configure the security group.

{{< figure src="./img/elastic_beanstalk_https.png" >}}


#### Docker {#docker}

-   Single Container: run one container per docker host (not efficient)
    -   It uses EC2 with docker, not ECS

-   Multiple container:
    -   Creates a ECS Cluster, where EC2 instance are provisioned in the cluster and an ELB for HA.
    -   You need to provide a Dockerrun.aws.json (version 2) in the source bundle (root level)
    -   Any images need to be stored in a container registery such as ECR


### Lightsail {#lightsail}

Cloud-based virtual private server (VPS) solution.

-   Includes everything to launch your project quickly for a low, predictable monthly price. That is VMs, containers, databases, content delivery network (CDN), load balancers, Domain Name System (DNS) management, and so on.


### SAM (Serverless Application Model) {#sam--serverless-application-model}

Open-source framework for building serverless applications.

-   Uses S3, CloudFront, APIGateway, Cognito, etc.
-   AWS SAM template specification is an extension of CloudFormation where you specify your serverless infrastructure.
-   SAM CLI is used to build, test, and deploy.

{{< figure src="./img/sam.png" >}}


### Outposts {#outposts}

Managed service that brings AWS infrastructure, services, APIs, and tools to the customer's premises.

-   **IMPORTANT:** VPCs can be extended to Outposts and subnets can be created inside it. Instances in outposts can communicate with the AWS region.


#### Extra {#extra}

-   Outpost site: physical location where Outpost is installed.
-   Outpost equipment:AWS-managed racks, servers, switches, and cabling to use AWS Outposts.
-   Service link allows communication between Outpost and associated region.
-   Local gateway allows communication between an Outpost rack and on-premises network.
    -   With AWS RAM, you can share the local gateway route table with other accounts or OUs.
-   Local network interface allows communication between an Outpost server and an on-premises network.


### Wavelength {#wavelength}

Service that allows developers to create applications with ultra-low latencies for mobile devices and end users.

-   **IMPORTANT:** Used for VPC, Subnet, and Network Border Group that need to leverage the 5G edge computing infrastructure.


#### WZ (Wavelength Zones) {#wz--wavelength-zones}

Logical extension of a region where the Wavelength infrastructure is deployed composed of compute, storage services, and carrier gateways.

-   Use for apps that require ultra-low latency, enhanced bandwidth, or improved service quality across 5G mobile networks.
-   Extend VPCs to run ultra-low latency apps with the same services, APIs, tools, and functionalities.
-   EC2 with a discovery service such as AWS Cloud Map to discover the closest WZ endpoint .
-   Apps running on 4G/LTE can also connect.
-   Wavelength application: app run a WZ.


#### Carrier Gateway {#carrier-gateway}

Provides connectivity between WZ and telecommunication carrier.

-   **IMPORTANT:** Supports only IPv4 IPs for the GW.

-   Enables inbound traffic from a carrier network in a specific location, as well as outbound traffic to the carrier network and the internet.
-   Only available for VPCs with WZ subnets.
-   To assign a network interface, use a carrier IP address from the network border group.


#### Pricing {#pricing}

-   Prices for AWS resources in WZs will differ from those in the parent region.
-   In WZs, EC2 instances are only available on demand.
-   WZ can be used with your Instance Savings Plan.


## Storage {#storage}


### EBS (Elastic Block Store) {#ebs--elastic-block-store}

Block level storage volumes for use with EC2 instances.

-   **IMPORTANT:** Decreasing the size of an EBS volume is not supported.
-   **IMPORTANT:** Data Lifecycle Manager can be used to take automatic EBS snapshots of volumes and EBS-backed AMIs.
    -   EBS direct APIs can be used to create snapshots, write and read from them and **read and copy the data from the snapshot to S3**.

-   Used as the primary storage for file systems, databases, or for any applications that require fine granular updates and access to raw, unformatted, block-level storage.
-   Termination protection is turned off by default and must be manually enabled.
-   Not resilient against AZ failure.
-   Snapshots are used (incremental backups stored redundantly in S3) to backup volumes.
-   Optimized Instances: provides the best performance by minimizing contention between EBS I/O and other traffic from your instance.
    -   EBS–optimized instances deliver dedicated bandwidth between 500 Mbps and 60,000 Mbps to EBS.


#### Types {#types}

-   Can change from gp2 to gp3 at any time.

-   gp2:

    -   3 IOPS/GiB, with the ability to burst to 3,000 IOPS for extended periods of time.
    -   Size from 1GB to 16TB and 250MB/s of throughput
    -   Good for boot volumes, low latency interactive apps, dev &amp; test

    {{< figure src="./img/amazon_ebs_gp2.png" >}}

-   gp3:

    -   Similar to gp2 but no credit system.
    -   Virtual desktops, medium size single instance dbs, low-latency interactive apps, dev &amp; test, boot volumes
    -   Consistent baseline rate of 3,000 IOPS and 125 MiB/s
    -   Can provision additional IOPS (up to 16,000) and throughput (up to 1,000 MiB/s) for an additional cost.

    {{< figure src="./img/amazon_ebs_gp3.png" >}}

-   io1, io2, io2 Block Express:

    -   I/O-intensive workloads, particularly database workloads, which are sensitive to storage performance and consistency.
    -   Higher durability and supports provisioning 500 IOPS/GB.
    -   EBS io2 has 100x better volume durability and a 10x higher IOPS to storage ratio than io1, for the same price as io1.

    {{< figure src="./img/amazon_ebs_io.png" >}}

-   Throughput Optimized st1:
    -   Low-cost magnetic storage that focuses on throughput rather than IOPS.
    -   **Maximum of 500 IOPS per volume**.
    -   Used in big data, data warehouses, log processing, and for frequently accessed throughput-intensive workloads.

-   Cold HDD sc1:
    -   Low-cost magnetic storage that focuses on storage of cold data.
    -   Throughput of up to 250 MiB/s.
    -   Used for infrequently accessed data and provides the lowest cost.

{{< figure src="./img/amazon_ebs_hdd.png" >}}


#### Encryption {#encryption}

Encrypt EBS volumes with a KMS key.

-   **IMPORTANT:** No direct way to encrypt an existing unencrypted volume, or to remove encryption from an encrypted volume.
    -   But can migrate data between encrypted and unencrypted volumes.

-   EBS encryption is only available on certain instance types.
-   EBS Encryption by Default can be enabled, ensuring that all new EBS volumes created are encrypted.

-   The following types of data are encrypted:
    -   Data at rest inside the volume
    -   All data moving between the volume and the instance
    -   All snapshots created from the volume
    -   All volumes created from those snapshots


#### Improving Performance {#improving-performance}

-   Use EBS-Optimized Instances
-   Understand How Performance is Calculated
-   Understand Your Workload
-   Be Aware of the Performance Penalty When Initializing Volumes from Snapshots
-   Factors That Can Degrade HDD Performance
-   Increase Read-Ahead for High-Throughput, Read-Heavy Workloads on st1 and sc1
-   Use a Modern Linux Kernel
-   Use RAID 0 (Redundant Array of Independent Disks) to Maximize Utilization of Instance Resources
-   Track Performance Using Amazon CloudWatch


#### Multi-Attach {#multi-attach}

Attach a single EBS volume to multiple EC2 instances (up to 16 instances).

-   Only supported to be attached by a subset of EC2 instance types.
-   Only supported on io1 and io2 volumes and specific regions.
-   Usually EFS is better as:
    -   EFS is designed to be scalable (autoresizing) and HA.
    -   EFS has storage lifecycle management.


### EFS (Elastic File System) {#efs--elastic-file-system}

Fully-managed file storage service that makes it easy to set up and scale file storage in the cloud automatically.

-   **IMPORTANT:** Linux only. Implementation of NFSv4.
-   **IMPORTANT:** To mount it to EC2 you don't need to change any NACL or SG.
-   **IMPORTANT:** To mount it to ECS or EKS, they must be in the same VPC and EFS must allow inbound connections on port 2049 from the cluster.

-   Store data and metadata across multiple AZs within a region.
-   Can be mounted on EC2, ECS, EKS, and Lambda.
-   Read-after-write consistency for data access.
-   Private service, via mount targets inside a VPC, but <span class="underline">can be accessed from on-premises</span> (VPN and DX).
    -   Mount targets provides an IP address for the NFSv4 endpoint.
    -   For HA, you need to add a mount target for every AZ you use.
-   Access Points: simplify how applications are provided access to shared data sets in an EFS file system.

{{< figure src="./img/amazon_efs.png" >}}


#### Modes {#modes}

-   Performance modes:
    -   General purpose (default): ideal for latency-sensitive use cases.
    -   Max I/O mode: can scale to higher levels of aggregate throughput and operations per second with slightly higher latencies for file operations.

-   Throughput modes:
    -   Bursting (default): throughput scales as your file system grows.
    -   Provisioned: you specify the throughput independently of the amount of data stored.


#### Storage Classes {#storage-classes}

-   Standard
-   IA (Infrequent Access): cost-optimized storage class for files that are accessed less frequently.
-   IA One Zone: same as IA but only stores information in 1 AZ.

-   Supports Intelligent-Tiering, same as S3.
-   Lifecycle policies can be used to move files not accessed in the last 30 days from Standard to IA.


### FSx {#fsx}

Fully managed third-party file system solution. It uses SSD storage to provide fast performance with low latency.

-   **IMPORTANT:** Not possible to update the deployment type of FSx once created. Need to re-create the file system.


#### FSx Lustre {#fsx-lustre}

A high-performance file system optimized for fast processing of workloads. <span class="underline">Parallel file system POSIX compliant</span>.

-   Can be integrated with S3 to presents file as S3 objects.
-   100's GB/s throughput &amp; sub millisecond latency
-   Accessible over VPN and direct connect

-   Deployment types:
    -   Scratch: highly optimized for short term no replication &amp; fast. **(no HA or replication)**.
    -   Persistent: longer term, HA (one AZ) self-healing for hardware failure. Has replication and auto-healing but only in one AZ.

{{< figure src="./img/amazon_fsx_lustre.png" >}}


#### FSX Windows {#fsx-windows}

A fully managed native Microsoft Windows file system with full support for the <span class="underline">SMB protocol, Windows NTFS, and Microsoft Active Directory (AD) integration</span>.

-   Supports DFS (distributed file system) scale-out file share structure.
-   On-demand and scheduled backups
-   Windows permission model
-   Single or Multi-AZ within a VPC.
    -   Accessible using VPC Peering, VPN, Direct Connect.

{{< figure src="./img/amazon_fsx_windows.png" >}}


#### FSX Netapp ONTAP {#fsx-netapp-ontap}

Shared file storage solution that provides high-performance SSD storage from <span class="underline">Linux, Windows, and macOS</span>.

-   Supports multi-protocol access to data using NFS, SMB, and iSCSI.


#### FSX OpenZFS {#fsx-openzfs}

File storage service that delivers up to 1 million IOPS with latencies of hundreds of microseconds.

-   Move data from on-premises ZFS without modifying application code.
-   With NFS protocol, OpenZFS file system is accessible from Linux, Windows, and macOS.
-   File system backups are stored on S3, with cross-region backup copies.


### S3 (Simple Storage Services) {#s3--simple-storage-services}

Stores data as objects within buckets.

-   Storage virtually unlimited with an individual object max size of 5TB.
-   Transfer Acceleration: fast, easy, and secure transfers of files over long distances between your client and an S3 bucket.
    -   It takes advantage of CloudFront globally distributed edge locations.
-   With the ACL, you can automatically assume ownership of objects that are uploaded to your buckets.
-   Batch Operations: perform large-scale batch operations on S3 objects, event-driven tasks like image processing (not real-time).


#### Components {#components}

-   Object: file and optionally any metadata that describes that file.
    -   **IMPORTANT:** For objects bigger than 5Gb, multipart upload API must be used (recommended for objects bigger than 100MB).
-   Key: unique identifier for an object within a bucket.

-   Bucket: region specific group of objects.
    -   Bucket name must be a unique DNS-compliant name.
    -   By default, limit of **100 buckets per account**.


#### Data Consistency Model {#data-consistency-model}

-   Read-after-write consistency for PUTS of new objects.

-   Strong consistency for read-after-write HEAD or GET requests.
-   Strong consistency for overwrite PUTS and DELETES in all regions.
-   Strong read-after-write consistency for any storage request

-   Eventual consistency for listing all buckets after deleting a bucket (deleted bucket might still show up).
-   Eventual consistency on propagation of enabling versioning on a bucket for the first time.


#### Storage Classes {#storage-classes}

<!--list-separator-->

-  Standard

    For general-purpose storage of frequently accessed data.

    -   Replication across at least 3 AZs.

    {{< figure src="./img/amazon_s3_standard.png" >}}

    -   Express One Zone: high-performance, single AZ storage class designed for frequently accessed data and latency-sensitive applications.
        -   Data access speeds by 10x and reduce request costs by 50% compared to Standard.
        -   Scales to process millions of requests per minute.

<!--list-separator-->

-  Infrequent Access

    -   Standard IA: for long-lived, but less frequently accessed data.

        -   Minimum duration charge of 30 days.
        -   Minimum capacity charge of 128KB per object.

        {{< figure src="./img/amazon_s3_standard_ia.png" >}}

    -   One Zone-IA: stores the object data in only one AZ.

        -   Minimum duration charge of 30 days.
        -   Minimum capacity charge of 128KB per object.

        {{< figure src="./img/amazon_s3_one_zone_ai.png" >}}

<!--list-separator-->

-  Intelligent Tiering

    Used for long-lived data with **changing or unknown patters**.

    -   **IMPORTANT:** Use Archive Access Tier to archive data that is rarely access within 3-5 hours.

    -   Monitor and automation cost per 1k objects.
    -   Monitors access patterns and moves objects that have not been accessed for 30 consecutive days to the infrequent access tier.
        -   If an object in the infrequent access tier is accessed later, it is automatically moved back to the frequent access tier.
    -   Supports the archive access tier.  If the objects haven't been accessed for 90 consecutive days, it will be moved to the archive access tier.

        -   After 180 consecutive days of no access, it is automatically moved to the deep archive access tier.

        {{< figure src="./img/amazon_s3_intelligent_tiering.png" >}}

<!--list-separator-->

-  Glacier

    For long-term archives.

    -   **IMPORTANT:** At the time of creation, Glacier cannot be selected. Data must be moved to it with for example Lifecycles.

    -   Objects not available for real-time access. First need to restore them.
    -   Minimum of 3 AZs.
    -   Retrieval Options:
        -   Expedited: quickly access your data when occasional urgent requests. Data available within 1–5 minutes.
            -   Types: On-Demand requests available most of the time and provisioned requests guaranteed to be available when needed.
        -   Standard (default): access any of your archived objects within several hours, typically within 3–5 hours.
        -   Bulk: lowest-cost retrieval option for retrieval of large amounts data inexpensively in a day, typically within 5–12 hours.

    <!--list-separator-->

    -  GLACIER INSTANT RETRIEVAL

        Long-lived data that are rarely accessed and must be retrieved in milliseconds.

        -   For data accessed only once every quarter.
        -   Resilient in the event of the destruction of one entire AZ.

        {{< figure src="./img/amazon_s3_glacier_instant.png" >}}

    <!--list-separator-->

    -  GLACIER FLEXIBLE RETRIEVAL

        For storing archive data that is accessed once or twice per year.

        -   Access times ranging from minutes to hours and free bulk retrievals.

        {{< figure src="./img/amazon_s3_glacier_flexible.png" >}}

    <!--list-separator-->

    -  GLACIER DEEP ARCHIVE

        Provides secure and durable object storage for long-term retention of data that is accessed rarely in a year.

        -   Lowest cost storage in the cloud.
        -   Can be restored within 12 hours or less.
        -   Bulk retrieval option, retrieve data within 48 hours.

        {{< figure src="./img/amazon_s3_glacier_deep_archive.png" >}}

<!--list-separator-->

-  On Outposts

    Uses S3 APIs to deliver object storage to an on-premises AWS Outposts environment.

    -   Data encrypted with SSE-C and SSE-S3 and redundantly stored across Outposts servers.
    -   With DataSync, you can automate data transfer between Outposts and regions.
    -   Access points can be used to access any object in an Outposts bucket.
    -   Supports S3 lifecycle rules.


#### Options {#options}

-   IgnorePublicAcls: ignore all public ACLs on a bucket and any objects that it contains.
    -   Enables to safely block public access granted by ACLs while still allowing PUT Object calls that include a public ACL.

-   BlockPublicAcls: PUT bucket ACL and PUT objects requests are blocked if granting public access.
    -   Enables to protect against public access while allowing to audit, refine, or otherwise alter the existing policies and ACLs for buckets and objects.

-   BlockPublicPolicy: rejects requests to PUT a bucket policy if granting public access.
    -   Reject calls to PUT access point policy for all of the bucket's same-account access points if the specified policy allows public access.

-   RestrictPublicBuckets: restricts access to principles in the bucket owners' AWS account.
    -   Blocks all cross-account access to the access point or bucket (except by AWS service principals), while still allowing users within the account to manage the access point or bucket.


#### Object Lock {#object-lock}

Prevents objects from being deleted or overwritten for a fixed amount of time or indefinitely.

-   **IMPORTANT:** Can only be configured when creating a new bucket.

-   Bucket must be versioned.
-   Cannot be disabled once enabled
-   Write-Once-Read-Many (WORM) No delete or overwrite (used with Glacier vaults with a vault lock policy).
-   Affect versions of objects but buckets can have defaults object lock settings.

    Types (can be both types) (can be overlapped)
-   Options (can be both):
    -   Retention period: object remains locked until the retention period expires.
        -   Modes
            -   Compliance: can't be adjusted, deleted, overwritten even the root users
            -   Governance: special permissions can be grated allowing lock settings to be adjusted s3:BypassGovernanceRetention and header x-amz-bypass-governance-retention:true

    -   Legal Hold: object remains locked until you explicitly remove it.
        -   s3:PutObjectlegalHold is required to add or remove it.
        -   Prevent accidental deletion of critical object versions

{{< figure src="./img/amazon_s3_object_lock.png" >}}


#### Object Delete {#object-delete}

-   Deleting Objects from a Version-Enabled Bucket:
    -   Specify a non-versioned delete request: specify only the object’s key, and not the version ID.
    -   Specify a versioned delete request: specify both the key and also a version ID.

-   Deleting Objects from an MFA-Enabled Bucket:
    -   If you provide an invalid MFA token, the request always fails.
    -   If you are not deleting a versioned object, and you don't provide an MFA token, the delete succeeds.


#### Select {#select}

Capability designed to pull out only the data needed from an object with SQL-like statements.

-   **IMPORTANT:** Glacier Select can only be used on uncompressed CSV format data and can only perform simple query operations.

-   Works only on CSV, JSON, Apache Parquet formatted objects, JSON Arrays, and BZIP2 compression for CSV and JSON objects and SSE objects.
-   Only billed for the data retrieved.

{{< figure src="./img/amazon_s3_select_and_glacier_select.png" >}}


#### Lifecycle Management {#lifecycle-management}

Set of rules that define actions that is applied to a group of objects.

-   Transition actions: when objects transition to another storage class.
    -   For S3-IA and S3-One-Zone, the objects must be stored at least 30 days in the current storage class before you can transition them to another class.
-   Expiration actions: when objects expire. S3 deletes expired objects on your behalf.
-   They can only go down the stack of classes, cannot be moved up the stack.

{{< figure src="./img/amazon_s3_lifecycle_configuration.png" >}}


#### Security {#security}

-   Resource Based Policies
    -   Bucket Policies: centralized access control to buckets and objects based on a variety of conditions, including S3 operations, requesters, resources, and aspects of the request (i.e. IP address).
        -   **IMPORTANT:** use "aws:sourceVpce" condition to restrict access to a specific S3 endpoint ID.
        -   Can either add or deny permissions across all (or a subset) of objects within a bucket.
        -   IAM users need additional permissions from root account to perform bucket operations.

    -   Access Control Lists (depreciated): list of grants identifying grantee and permission granted.
        -   ACLs use an S3–specific XML schema.
        -   Can grant permissions only to other AWS accounts, not to users in your account.
            -   You cannot grant conditional permissions, nor explicitly deny permissions.
            -   Object ACLs are limited to 100 granted permissions per ACL.
            -   The only recommended use case for the bucket ACL is to grant write permissions to the S3 Log Delivery group.

{{< figure src="./img/s3_policies_demo.png" >}}

<!--list-separator-->

-  PRESIGNED URLS

    Allow unauthenticated users to be able to see S3 object with the credentials from an authenticated users.

    -   **IMPORTANT:** When using the URL, the permissions matches the identity which generated it at the time of using.
    -   **IMPORTANT:** Don't generate base on a role as the URL will stop working when temporary credentials expire.
        -   Always long term identities.

    -   Time limited and contain all authentication needed for GET and PUT operations.

    {{< figure src="./img/amazon_s3_presigned_urls.png" >}}

<!--list-separator-->

-  CROSS-ACCOUNT ACCESS

    Can enable access to a bucket from other accounts by:

    -   Resource-based policies and IAM policies for programmatic-only access to S3 bucket objects .
    -   ACL) and IAM policies: cross-account IAM roles for programmatic and console access to S3 bucket objects.
    -   Cross-account access points using the S3 console or the AWS CLI.
        -   Supports failover controls for S3 Multi-Region access points.


#### Encryption {#encryption}

-   **IMPORANT:** When using SSE in S3, symmetric keys must be used.

-   Buckets are not encrypted, objects are, and they can use different type of encryption
-   SSE is mandatory where S3 handles the encryption keys and manages the encryption
-   SSE save the computation time compared to CSE

-   Components
    -   Encryption and decryption process
    -   Management of the encryption keys

{{< figure src="./img/amazon_s3_SSE.png" >}}

<!--list-separator-->

-  SSE-S3 (S3 Managed Keys) (default)

    -   S3 generates a key for every object different from any
    -   S3 manages all they keys and you have no control on how s3 manages the keys
    -   Encrypts data with SHA256

    -   Problems
        -   For highly regulated environment where you need to control the keys
        -   When you need to rotate the keys
        -   You need role separation (as any s3 full administration will always be able to view the data)

    {{< figure src="./img/amazon_s3_SSE-S3.png" >}}

<!--list-separator-->

-  SSE-KMS (KMS Keys Stored in AWS Key Management Service)

    -   KMS manages the encryption and decryption keys with your own KMS Key
    -   Key is fully configurable
    -   KMS keys can only encrypt object up to 4KB in size, they are use to generate data encryption keys which don't have that limitation
    -   You have logging and auditing and full management of the encryption keys
    -   Best benefit is the role separation as you need access to the KMS key it was originally used
    -   Useful as it can automatically rotate the keys

    {{< figure src="./img/amazon_s3_SSE-KMS.png" >}}

    <!--list-separator-->

    -  Bucket Keys

        -   Each object put inside S3 uses a unique DEK
        -   KMS has a cost and has a limit on calls per second which imposes limitations
        -   To solve it, a bucket key is created to encrypt all objects in a time frame with the same encryption key

        {{< figure src="./img/amazon_s3_SSE-KMS_bucket_keys.png" >}}

        -   If used, CloudTrail KMS events now show the bucket and not the individual objects
        -   Works with replication, encryption is maintained
        -   If replicating a plate text to a bucket with bucket keys, the object is encrypted at the destination side (ETAG changes)

<!--list-separator-->

-  SSE-C (Customer Provided Keys)

    -   **IMPORTANT:** To use SSE-C at rest and in-transit encryption you must set the following headers:
        -   For Amazon S3 REST API calls: x-amz-server-side-encryption-customer-algorithm, x-amz-server-side-encryption-customer-key, x-amz-server-side-encryption-customer-key-MD5.
        -   For presigned URLs: x-amz-server-side-encryption-customer-algorithm request header.

    -   Customer is responsible for the keys but s3 manages the encryption
    -   Good for high regulation as you manage your own keys
    -   If you need to manage also the encryption and decryption process then use CSE

    {{< figure src="./img/amazon_s3_SSE-C.png" >}}


#### Replication {#replication}

Enables automatic, asynchronous copying of objects across buckets in different regions and accounts.

-   **IMPORTANT:** If using a different account, in the destination bucket the role used is not trusted by default.
    -   Need to add a bucket policy to allow the role to replicate objects into that bucket.
-   **IMPORTANT:** Versioning must be enabled. By default it is not retroactive (does not update updated files from the destination to the source).

-   One-way replication by default, but there is an optional bi-directional replication.
-   Batch replication can be used to replicate existing objects.
-   Not available for Client Side Encryption.
-   Cannot replicate to Glacier, need to use lifecycle policies.
-   It doesn't replicate the deletion in the destination bucket. This protects data from malicious deletions.

{{< figure src="./img/amazon_s3_replication.png" >}}

<!--list-separator-->

-  SRR (SAME REGION REPLICATION)

    -   Used for log aggregation, production and testing environment sync, or resilience with strict sovereignty (only one aws region).

<!--list-separator-->

-  CRR (CROSS REGION REPLICATION)

    -   Used for global resilience and latency reduction.

    -   **IMPORTANT:** If want to access a bucket in one region from another and the storage is high but transfer is low:
        -   Set up a interface endpoint using PrivateLink and connect the other region with the first with VPC peering.

    Requirements of CRR:

    -   Both source and destination buckets must have versioning enabled.
    -   The source and destination buckets must be in different AWS Regions.
    -   S3 must have permissions to replicate objects from the source bucket to the destination bucket on your behalf.
    -   If the owner of the source bucket doesn’t own the object in the bucket, the object owner must grant the bucket owner READ and READ_ACP permissions with the object ACL.


#### Versioning {#versioning}

Keep multiple versions of an object in one bucket. Protects from unintended overwrites and deletions.

-   When versioning is enabled, old objects get a **null Version ID** and new will have an alphanumeric Version ID.
-   When an object is deleted, all versions remain in the bucket and S3 inserts a delete marker.


#### Find IP From Object Level Requests {#find-ip-from-object-level-requests}

<!--list-separator-->

-  Server Access Logs

    Provides detailed records for the requests that are made to a bucket.

    -   Includes the IP addresses that issued the requests.
    -   S3 stores server access logs as objects in an S3 bucket.
    -   Athena can then be used to query Amazon S3 access logs using SQL queries.

<!--list-separator-->

-  CloudTrail Data Events

    Capture the last 90 days of bucket-level events (i.e. PutBucketPolicy and DeleteBucketPolicy) and you can enable object-level logging.

    -   Find the IP addresses used with each upload to your bucket.
    -   It might take a few hours for CloudTrail to start creating logs.


#### Access Points {#access-points}

Simplify managing access to S3 buckets and objects by splitting a bucket in mini buckets.

-   **IMPORTANT:** Can only be created by the AWS account that owns the bucket.

-   Rather than 1 bucket with 1 bucket policy, it can be created many access points, each with different policies with different access controls.
-   Each access point has its own endpoint address
-   "aws s3control create-access-point ..."

{{< figure src="./img/amazon_s3_access_points.png" >}}


#### Storage Lens {#storage-lens}

Cloud-storage analytics feature to visualize insights and trends, flag outliers, and receive recommendations.

-   Used to gain organization-wide visibility into object-storage usage and activity.
-   Generate summary insights, such as finding out how much storage you have across your entire organization or which are the fastest-growing buckets and prefixes.
-   Identify cost-optimization opportunities, implement data-protection and security best practices, and improve the performance of application workloads.


#### Pricing {#pricing}

Charges only for storing objects in the bucket and for transferring objects in and out of the bucket.

-   You can configure a bucket to be a "Requester Pays bucket". The requester pays the cost of the request and the data download from the bucket. Owner pays for the storage cost.
    -   If Requester Pays is enabled, anonymous access is not allowed.

-   You pay for all bandwidth in and out of S3 except:
    -   Data transfers in from the internet
    -   Data transfers out to EC2 if they are in the same region
    -   Data transfers out to CloudFront


### Transfer Family {#transfer-family}

Secure transfer service for moving files into and out of AWS storage services, such as **Amazon S3 and Amazon EFS with SFTP FTP, FTPS, and AS2**.

-   Fully managed service and scales in real time.
-   Managed File Transfer Workflows (MFTW): fully managed, serverless service to set up, run, automate, and monitor files uploaded to TF.
-   Identities providers: service managed (SSH keys), Microsoft AD, custom via RESTful (lambda/APIGW)

{{< figure src="./img/amazon_transfer_family.png" >}}


#### Endpoint Types {#endpoint-types}

-   Publicly accessible: only SFTP. Can be changed to a VPC hosted endpoint, server must be stopped before making the change.
-   VPC hosted: only SFTP and FTPS are supported. Can be optionally set as internet facing.

{{< figure src="./img/amazon_transfer_family_endpoint_types.png" >}}


#### Extra {#extra}

-   Cost: provisioned server per hour and data transferred
-   Custom DNS hostname with Amazon Route 53
-   Up to 3 AZs backed by an ASG


### Storage Gateway {#storage-gateway}

Hybrid storage between on-premises environments and the AWS Cloud.


#### File Gateway {#file-gateway}

File interface into S3 that bridges with on-premises file storage though mount points (shares) available via **NFS or SMB**.

-   **IMPORTANT:** Data is not accessible in the AWS cloud on a file system, it is accessible on S3.

-   File Gateway supports up to 10 bucket shares and the local cache supports up to 64TB.
-   Supports object lock, enabling write-once-read-many (WORM) file-based systems to store and access objects in Amazon S3.
-   File gateway supports Standard, Standard IA, One Zone IA.
-   Any modifications from the clients are stored as new versions of the object, keeping the versions.

-   Capabilities:
    -   Store and retrieve files directly using the NFS or SMB
    -   Access your data directly in S3 from any AWS Cloud application or service.
    -   Manage S3 data using lifecycle policies, cross-region replication, and versioning.
    -   Extend the storage size of on-premises locations.


#### Volume Gateway {#volume-gateway}

Cloud-backed storage **volumes** that you can mount as **iSCSI, NFS, or SMB** devices from your on-premises application servers.

-   **IMPORTANT:** EBS, S3, and S3 Glacier can be used as cloud storage solutions.
-   **IMPORTANT:** Does not provide access to the data from AWS directly. Need additiona steps.

-   The VM of the SGV provides volumes over iSCSI to the on premise servers.
-   Used for migrations, extensions to on-premise, storage tiering, DR and replacement of backup systems.
-   Cached volumes: retain a copy of frequently accessed data subsets locally.
    -   Range from 1 GiB to 32 TiB.
    -   Each gateway configured for cached volumes can support up to 32 volumes.

<!--list-separator-->

-  Stored Volumes

    Low-latency access to the entire dataset.

    -   **IMPORTANT:** Consumes capacity on-premise, all stored local. Does not extend on-premises capacity.

    -   Storage volumes range from 1 GiB to 16 TiB.
    -   Used for full disk backups of servers (for short RPO and RTO) and for DR
    -   Has a upload buffer disk where data is copied asynchronously to AWS over the Storage Gateway Endpoint (public endpoint).
        -   The copy is performed as EBS snapshots of the upload buffer.

    {{< figure src="./img/storage_gateway_volume_stored.png" >}}

<!--list-separator-->

-  Volume Cached

    Detach and attach volumes, from and to a Volume Gateway.

    -   Used to migrate volumes between gateways to refresh underlying server hardware.
    -   On-premise storage is increase as you can have a lot of TBs in S3 and only cache a subset.
    -   It has a local cache to load data to S3. **S3 is the primary storage where the data is stored, not locally**.
        -   It uses a AWS managed area of S3 (cannot access to the bucket)

    {{< figure src="./img/storage_gateway_volume_cached.png" >}}


#### Tape Gateway {#tape-gateway}

Archive backup data in Amazon Glacier.

-   **IMPORTANT:** Connects via iSCSI.

-   Has a virtual tape library (VTL) interface to store data on virtual tape cartridges.
-   Integrates with S3 Glacier Deep Archive.
-   Capability to move virtual tapes archived in S3 Glacier to S3 Glacier Deep Archive storage class,
-   Supports Write-Once-Read-Many and Tape Retention Lock on virtual tapes.

{{< figure src="./img/storage_gateway_tape.png" >}}


## Databases {#databases}


### RDS (Relational Database Service) {#rds--relational-database-service}

-   Database Server as a Service of MySQL, MariaDB, PostgreSQL, Oracle, Microsoft SQL Server

-   **IMPORTANT:** You can monitor the available storage space with FreeStorageSpace metric in CloudWatch.
-   **IMPORTANT:** Oracle RAC is not supported, must be run on EC2 instances.

-   Manages backups, software patching, automatic failure detection, and recovery.
-   Lives in a VPC but no SSH access or to the OS.
-   Used for complex schemas and features, not for simple look up tables.

{{< figure src="./img/rds_architecture.png" >}}


#### Instance Lifecycle {#instance-lifecycle}

Creating, modifying, maintaining and upgrading instances, performing backups and restores, rebooting, and deleting the instance.

-   Can stop a DB instance for up to 7 days. Automatically started after 7 days.
-   Can enable deletion protection, disabled by default.

-   Can't stop an Amazon RDS for SQL Server DB instance in a Multi-AZ configuration.
-   Can't stop a DB instance that has a Read Replica, or that is a Read Replica.
-   Can't modify a stopped DB instance.


#### Storage Auto Scaling {#storage-auto-scaling}

Automatically scales storage capacity in response to growing database workloads, with zero downtime.

-   Continuously monitors and scales capacity up automatically when actual utilization approaches provisioned storage capacity.


#### Security {#security}

-   **IMPROTANT:** VPC attributes DNS hostnames and DNS resolutions must be enabled to allow public access to a DB instance withing a VPC.

-   Security Groups:
    -   DB Security Groups: controls access to a DB instance that is not in a VPC. By default, network access is turned off to a DB instance.
    -   VPC Security Groups: controls access to a DB instance inside a VPC.
    -   EC2 Security Groups: controls access to an EC2 instance and can be used with a DB instance.

<!--list-separator-->

-  Encryption

    -   Can't have an encrypted RR of an unencrypted DB instance or an unencrypted RR of an encrypted DB instance.
    -   Can't restore an unencrypted backup or snapshot to an encrypted DB instance.
    -   Can use SSL from your application to encrypt a connection to a DB instance.

    -   Encryption in transit with SSL/TLS, and can be made mandatory
    -   EBS volume encryption with KMS which generates a DEK (Data Encryption Key)
        -   If used all storage, logs, snapshots &amp; replicas are encrypted and the encryption cannot be removed.
        -   **IMPORTANT:** To remove encryption, export the db and create a new unencrypted db instance.

    -   TDE (Transparent data encryption) (encryption handled within db engine) can be enabled in Microsoft SWL and Oracle
    -   CloudHSM supported by Oracle (most secure) (no key exposure to AWS)

    {{< figure src="./img/rds_encryption.png" >}}

<!--list-separator-->

-  Authorization

    -   MySQL and PostgreSQL both support IAM database authentication.

    {{< figure src="./img/rds_iam_authentication.png" >}}


#### Multi-AZ {#multi-az}

Automatically provisions and maintains a secondary standby DB instance in a different AZ

-   Synchronously replication across AZs
-   Used for data redundancy, failover support, eliminate I/O freezes, and minimize latency spikes during system backups.

-   Automatic failover if:
    -   AZ outage
    -   Primary DB instance fails
    -   DB instance's server type is changed
    -   OS of the DB instance is undergoing software patching
    -   Manual failover of the DB instance was initiated using Reboot with failover

<!--list-separator-->

-  Instance Deployment

    -   Has a primary instance and replicates to a standby instance in another AZ (synchronous sync)
    -   Only one standby replica which can't be used for read or writes, only for failovers
    -   Backups are taken from it to improve performance
    -   Failover within 60 to 120s

    {{< figure src="./img/rds_multiaz_instance_deployment.png" >}}

<!--list-separator-->

-  Cluster

    -   Main DB instance for writing and 2 instances for reading, all in different AZ.
    -   Writer can be used to write and read, and readers only to read.
    -   Data is committed when 1+ reader finishes writing.
    -   Replication is via transaction logs.
    -   Failover around 35s

    -   Types of endpoints:
        -   Cluster Endpoint: points at the writer. Used for reads, writes, and admin
        -   Reader Endpoint: directs any reads at an available reader instance
        -   Instance Endpoints: points at a specific instance, generally used for testing and fault finding

    {{< figure src="./img/rds_multiaz_cluster.png" >}}


#### Read Replicas {#read-replicas}

-   **IMPORTANT:** Same region or other regions. cross replicate RR (AWS handles networking).
-   **IMPORTANT:** Can be promoted to stand-alone instances for DR but they require a reboot and a couple of minutes of downtime.

-   Asynchronous replication for higher read throughput and DR.
-   Up to 5 direct RR per DB instance. Each RR can have other RRs (might have lag problems).

-   Near zero RPO as they can be promoted quickly. Failure only (as corrupted data can be duplicated)


#### Backups &amp; Restores {#backups-and-restores}

Stored in AWS managed S3 buckets.

<!--list-separator-->

-  Automatic Backups

    -   **IMPORTANT:** Cannot use CRR as they are AWS managed S3 buckets.

    -   DB instance must be in the ACTIVE state for automated backups to occur.
    -   Retained between 0 and 35 days, if 0 no automatic backups
    -   Point-in-time recovery: creates a new DB instance from a specific point in time.
    -   Can be retained (system snapshots and transaction logs) when DB is deleted but they expire based on retention period.
    -   Taken 1 per day but transaction logs are saved to S3 every 5 min (5 min RPO).

<!--list-separator-->

-  Snapshots

    -   **IMPORTANT:** manual DB snapshots can be shared with up to 20 AWS accounts. Automated RDS snapshots cannot be shared directly with other AWS accounts.

    -   Incremental: first snapshot is a full backup, then only incremental backups.
    -   Don't expire
    -   Can be exported to S3 as Apache Parquet format


#### RDS Proxy {#rds-proxy}

Fully managed DB proxy for rds/aurora, which auto scales and is HA by default.

-   Maintains a pool of connections to the database
-   Only accessible from a VPC, from a proxy endpoint
-   Use for serverless, high number of connections to the DB, or low power devices.
-   Connection pooling to reduce db load
-   Multiplexing for less connections

{{< figure src="./img/rds_proxy.png" >}}


#### RDS Custom {#rds-custom}

Fills the gap between RDS and EC2 running a DB Engine

-   Use RDS but access OS/Engine of the EC2 instance
-   Currently works with MS SQL and Oracle
-   Can connect with SSH, RDP, Session Manager
-   You will see EC2 instance, EBS volumes and backups in the AWS accounts.
-   RDS Custom Database Automation needs to be paused to customize, and then resume.


#### Extra {#extra}

-   Cost:
    -   Instance &amp; type
    -   Multi AZ or not
    -   Storage type &amp; amount
    -   Data Transferred
    -   Backups &amp; Snapshots
    -   Licensing


### Aurora {#aurora}

Fully managed relational database engine compatible with MySQL and PostgreSQL with much higher throughput.

-   **IMPORTANT:** Referred as Provisioned DB Cluster when not using Aurora serverless
-   **IMPORTANT:** Cannot use Auto Scaling for the master database, only manually resize the instance size of the master node.
-   **IMPORTANT:** Auto Scaling is possible for Aurora Replicas NOT for Aurora Writes or Master.


#### Components {#components}

-   DB Cluster: 1 or more DB instances and a cluster volume
-   Cluster Volume: virtual DB storage volume copied in multiple AZs.

-   Cluster Types:
    -   Primary DB instance: supports read and write operations, and performs all of the data modifications to the cluster volume. One for each cluster.
        -   If no Replicas are used, failover is performed by creating a new primary DB instance.
    -   Aurora Replica: connects to cluster volume and supports only read operations. <span class="underline">Up to 15 Aurora Replicas</span>.
        -   **IMPORTANT:** Automatically failover to an Aurora Replica in case the primary DB instance becomes unavailable by promoting it to a primary DB instance.
        -   Used to offload read workloads from the primary DB instance.

-   **IMPORTANT:** When primary instance is rebooted, all replicas are also restarted. Therefore, no failover occurs.

-   Instance Types: memory optimized and burstable performance


#### Endpoints {#endpoints}

-   Cluster endpoint: points to the current primary DB instance. Only endpoint that can do write operations.
-   Reader endpoint: points to an available replica (load balance across them). If no replicas, defaults to the primary instance. Only for reading operations.
-   Custom endpoints: points to a set of DB instances that you choose (load balance across a group).
-   Instance endpoint: points to a specific DB instance within a cluster. Used for diagnose capacity or performance issues that affect one specific instance.

-   **IMPORTANT:** If there is too many connections to the db it is best to use a RDS Proxy connection before the reader endpoint


#### Storage &amp; Reliability {#storage-and-reliability}

Data is stored in the cluster volume, which is designed for reliability which consists of copies of the data across multiple AZs in a single region.

-   **IMPORTANT:** Aurora Auto Scaling to automatically add and remove Aurora Replicas in response to changes in performance metrics.
-   **IMPORTANT:** Dynamic resizing automatically decreases the allocated storage space when data is deleted.
-   **IMPORTANT:** Backtrack feature: rewinds or restores the DB cluster to the time you specify. Backtrack window limit of 72 hours.

-   Includes a high-performance storage subsystem which grows automatically up to 128 terabytes. <span class="underline">The minimum storage is 10GB</span>.
-   Maintains <span class="underline">6 copies of your data across 3 AZs</span> with synchronous replication.
-   Automatically detects failures in the disk volumes that make up the cluster volume and immediately repairs the segment.
-   Performs crash recovery asynchronously on parallel threads, so that the DB is open and available immediately after a crash.


#### Global Database {#global-database}

Spans multiple AWS Regions, enabling low latency global reads and disaster recovery from region-wide outages.

-   **IMPORTANT:** Manual failover, detach the secondary DB so it promotes it to a standalone DB cluster.
    -   Reconfigure app to send write operations to the new endpoint for the secondary DB.
    -   Add another AWS region to the new DB cluster.
-   **IMPORTANT:** To ensure read-after-write consistency and minimal latency between regions:
    -   Use write forwading in the second region to be able to accept write operations.
-   **IMPORTANT:** To test DR producedures, use managed planned failover.
    -   DON'T USE IT for DR only for testing. This is because it needs the primary DB to be avaialble to initiate the failover.

-   Consists of one primary region where your data is mastered, and one read-only, secondary region.
-   Has managed planned failover capability to change which region hosts the primary cluster.
-   Recover in less than 1 minute with a RPO of 5 seconds and a RTO of less than 1 minute.


#### Serverless {#serverless}

On-demand, autoscaling configuration for Aurora to automatically starts up, shuts down, and scales up or down capacity based on app needs.

-   Mix and max ACUs (Aurora Capacity Units, combination of processing and memory capacity) is specified and billed for that in per second basis.
-   Connection managed by a shared proxy fleet.
-   Can be paused after a given amount of time with no activity. Automatically resumes after receiving requests.
-   Used for infrequently used apps, new apps, variable or unpredictable workloads, dev and test databases, multi-tenant applications.

{{< figure src="./img/aurora_severless.png" >}}

<!--list-separator-->

-  Limitations

    -   **IMPORTANT:** Can't have a public IP. Access only from within a VPC. Requires 2 AWS PrivateLink endpoints.

    -   Supports specific MySQL and PostgreSQL versions only.
    -   Port number must be 3306 for Aurora MySQL and 5432 for Aurora PostgreSQL.
    -   No support for:
        -   Loading data from an Amazon S3 bucket
        -   Saving data to an Amazon S3 bucket
        -   Invoking an AWS Lambda function with an Aurora MySQL native function
        -   Aurora Replicas
        -   Backtrack
        -   Multi-master clusters
        -   Database cloning
        -   IAM database authentication
        -   Restoring a snapshot from a MySQL DB instance
        -   Amazon RDS Performance Insights

<!--list-separator-->

-  Extra

    -   Serverless Cluster is managed by shared pool by AWS
    -   Doesn't support fast failover, but it supports automatic multi-AZ failover.
    -   Cluster volume is always encrypted (encryption key can be chosen but cannot turn it off).
    -   Can share snapshots with other accounts or publicly, or copy them across regions.


#### Multi-Master {#multi-master}

Create multiple read-write instances across multiple AZs.

-   No cluster or reader endpoint, app connects to the instances by itself.
-   When an instance writes the data, changes are proposed to the 6 replicas, commits if quorum is reached (majority).
-   In the event of a failure, it maintains read and write availability with zero application downtime. No need for failovers.

{{< figure src="./img/aurora_multi_master.png" >}}


#### Pricing {#pricing}

-   No free tier
-   Offers better value for anything above RDS single AZ micro.
-   Billed compute hourly charge per second 10 minute min.
-   Billed storage GB month consumed (high water mark), IO cost per request
-   Serverless is billed by ACUs in a per second basis.
-   100% db size in backups are included


#### Extra {#extra}

-   Backups work the same way as RDS
-   Fast clones: only stores the differences between the source data and the clone. Make new DB faster.

-   Deletion protection enabled by default for a production DB cluster using Console. Disabled by default if CLI or API are used.
-   For Aurora MySQL, DB instance cannot be deleted in a DB cluster if both of the following conditions are true:
    -   The DB cluster is a Read Replica of another Aurora DB cluster.
    -   The DB instance is the only instance in the DB cluster.

-   Monitoring:
    -   RDS Enhanced Monitoring: look at metrics in real time for the operating system.
    -   RDS Performance Insights: monitors your DB instance load to analyze and troubleshoot DB performance.


### DynamoDB {#dynamodb}

NoSQL wide column key-value serverless database service that provides fast and predictable performance with seamless scalability.

-   **IMPORTANT:** When a request is throttled, it fails with an HTTP 400 code (Bad Request) and a ProvisionedThroughputExceededException.
-   **IMPORTANT:** Adaptive capacity is enabled by default.

-   Can also store structure data but does not support SQL queries.
-   Public service with event-driven integration.
-   Encryption at rest using KMS.
-   Stores data redundantly across AZs across SSD drives.
-   AWS gives IP address ranges for endpoints for routing and firewall policies.

{{< figure src="./img/dynamodb_tables.png" >}}


#### Components {#components}

-   Table: schemaless collection of items.
-   Items: collection of attributes

-   Attributes: fundamental data element with supports of nested attributes up to 32 levels deep.
    -   Scalar: exactly one value (i.e. number, string, binary, Boolean, and null).
    -   Document: complex structure with nested attributes (i.e. JSON document).
    -   Set: multiple scalar values which can be string set, number set, and binary set.

-   Primary key: unique identifier of each item in the table. Must be scalar.
    -   Simple: if only one partition key is used.
    -   Composite: if a partition key and a sort key are used.

-   Secondary Indexes: allows for querying using an alternate key, in addition to the primary key.
    -   Global secondary index: index with a partition key and sort key.
        -   Can be created at any time. Up to 20 per table.
        -   Have their own RCU and WCU allocations.
        -   Recommended as default. Eventually consistent

    -   Local secondary index: index with the same partition key as the table, but a different sort key.
        -   Must be created with the table, no afterwards. Up to 5 per table.
        -   Shares RCU and WCU with the table.
        -   Only used when strong consistency is required.


#### Throughput Management {#throughput-management}

-   On-Demand: unknown, unpredictable, low admin
    -   Price per million R or W units but can be 5x compared to provisioned
    -   Pay per request.

-   Provisioned: RCU and WCU set on a per table basis
    -   Pay for throughput 24/7.
    -   Every operation consumes at least 1 RCU/WCU
    -   Every table and global secondary index has a RCU and WCU burst pool (300s)
    -   Subject to throttling.

    -   DynamoDB Auto Scaling: define upper and lower limits for RCUs and WCUs, and target utilization percentage within that range (scaling policy).
        -   When using the console, enabled by default
        -   If enabled for a table that has one or more global secondary indexes, recommended to also apply auto scaling uniformly to those indexes.

    -   Reserved capacity: pay a lower one-time upfront fee and commit to a minimum usage level over a period of time.


#### Consumption, Consistency &amp; Methods {#consumption-consistency-and-methods}

-   WCU (Write Capacity Unit) 1 KB per second
-   RCU (Read Capacity Units)  4KB per second
-   Maximum size per item of 400KB

-   ScannedCount: number of items that matched the key condition expression, before a filter expression (if present) was applied.
-   Count: number of items that remain, after a filter expression (if present) was applied.

{{< figure src="./img/dynamodb_consistency.png" >}}

<!--list-separator-->

-  EXPERSSIONS

    -   Expression attribute name: placeholder used as an alternative actual name. Must begin with a #
    -   Expression attribute values: substitutes for the actual values. Values that you might not know until runtime. Must begin with a :.

    -   Use projection expressions to get only a few attributes of an item.

<!--list-separator-->

-  READS

    -   Strongly consistent read request consumes one read capacity unit (reads the leader node)
    -   Eventually consistent read request consumes 0.5 of a RCU.

    -   Methods:
        -   GetItem: reads a single item from a table.
        -   BatchGetItem: reads up to 100 items, from one or more tables.
        -   Query: reads multiple items that have the same partition key value.
        -   Scan: reads all of the items in a table

<!--list-separator-->

-  WRITES

    -   UpdateItem: can be used to implement an atomic counter, there there are conditional operations:
        -   PutItem: writes a single item to a table.
        -   UpdateItem: modifies a single item in the table.
        -   DeleteItem: removes a single item from a table.
        -   BatchWriteItem: writes up to 25 items to one or more tables.

        -   Conditional writes can be idempotent: performs a write request only if certain condition expression evaluates to true.

<!--list-separator-->

-  QUERY

    Finds items based on PK values or a composite PK (a partition key and a sort key).

    -   A single Query operation can retrieve a maximum of 1 MB of data.
    -   Limit parameter: maximum number of items returned in a query.

<!--list-separator-->

-  SCAN

    Reads every item in a table or a secondary index and returns all of the data attributes for every item in the table or index.

    -   Always returns a result set. If no matching items are found, the result set will be empty.
    -   Eventually consistent reads, by default with sequential data processing.
    -   A single Scan request can retrieve a maximum of 1 MB of data.


#### TTL (Time-To-Live) {#ttl--time-to-live}

Define when items expire so that they can be automatically deleted.

{{< figure src="./img/dynamodb_ttl.png" >}}


#### Backups {#backups}

<!--list-separator-->

-  On-Demand Backups

    -   Full copy of the table but
    -   Retained until removed
    -   Don't consume any provisioned throughput
    -   No guarantee for casual consistency
    -   Can be same or cross region, with or without indexes, adjust encryption settings
    -   Cannot overwrite an existing table during a restore operation.
    -   Restore backups to a new table.

    -   Included
        -   Database data
        -   Global secondary indexes
        -   Local secondary indexes
        -   Streams
        -   Provisioned read and write capacity

    -   While a backup is in progress, you can’t do the following:
        -   Pause or cancel the backup operation.
        -   Delete the source table of the backup.
        -   Disable backups on a table if a backup for that table is in progress.

<!--list-separator-->

-  PITR (Point-In-Time Recovery)

    -   Continuous record of changes allows replay to any point in the window (35 day recovery window) (1 sec granularity)
    -   Not enabled by default


#### Transactions {#transactions}

Make coordinated, all-or-nothing changes to multiple items both within and across tables.

-   Provide atomicity, consistency, isolation, and durability (ACID).
-   Can group multiple Put, Update, Delete, and ConditionCheck actions. Submit the actions as a single TransactWriteItems operation that either succeeds or fails as a unit.
-   Can group and submit multiple Get actions as a single TransactGetItems operation.
-   Up to 25 unique items and 4 MB of data per transactional request.


#### Streams &amp; Triggers {#streams-and-triggers}

-   Streams: time ordered list of item changes in a table.
    -   24 hour rolling window, and enabled manually per table basis
    -   Contains records and name of the table, the event timestamp, and other metadata.
    -   Records organized into groups or shards.
    -   Records:
        -   New items: image of the entire item.
        -   Updates: captures the "before" and "after" image.
        -   Deletes: captures the image before it was deleted.

-   Trigger: changes generate an event and action is taken using the changed data (Streams + Lambda)
    -   Used for reporting &amp; analytics and aggregation, messaging or notifications
    -   Also used in data replication within and across regions, materialized views of data in DynamoDB tables, data analysis using Kinesis materialized views.


#### DAX (DynamoDB Accelerator) {#dax--dynamodb-accelerator}

Fully managed, highly available, in-memory cache with microsecond response time for accessing eventually consistent data.

-   Minimal functional changes to be added and scaled on-demand.
-   Useful for read-intensive workloads, but not write-intensive ones or the need of strongly consistent reads.
-   Supports server-side encryption as well as encryption in transit.
-   For HA, provision DAX cluster with at least 3 nodes in different AZs in a VPC (**not public**).
-   Write-Through is supported (data is written to DB then to DAX)

{{< figure src="./img/dynamodb_dax.png" >}}

<!--list-separator-->

-  Components

    -   Primary node: read and write nodes
        -   Nodes are HA, if primary fails then election is performed.
    -   Replica nodes: replication of data as Read Replicas.

    -   Has an endpoint and it is load balances across the nodes

    -   Scaling options:
        -   Horizontal scaling: add read replicas to the cluster up to 10 read replicas. Can be modified when running.
        -   Vertical scaling: select different node types to store more data in memory.
            -   Can't be modified when running. Create a new cluster with the desired node type.


#### Global Tables {#global-tables}

Multi-master cross-region tables with asynchronous replication.

-   Replica table: single table that functions as a part of a global table (max 1 per region).
    -   Regions are specified and DynamoDB handles the creation and propagation of changes.
-   Read and write can occur to any region and generally sub-second replication between regions
-   Last writer wins is used for conflict resolution for eventual consistency.
-   Strongly consistent reads only in the same region as writes.
-   Used for global HA and global data performance or global disaster recovery or business continuity

<!--list-separator-->

-  Extra

    Requirements for adding a new replica table

    -   The table must have the same partition key as all of the other replicas.
    -   The table must have the same write capacity management settings specified.
    -   The table must have the same name as all of the other replicas.
    -   The table must have DynamoDB Streams enabled, with the stream containing both the new and the old images of the item.
    -   None of the replica tables in the global table can contain any data.

    If global secondary indexes are specified, then the following conditions must also be met:

    -   The global secondary indexes must have the same name.
    -   The global secondary indexes must have the same partition key and sort key (if present).


#### Pricing {#pricing}

-   Charges based on the usage of the table and the amount of data that is read.
-   Charges per GB of disk space that your table consumes. The first 25 GB consumed per month is free.
-   Charges for Provisioned Throughput: WCU and RCU, Reserved Capacity and Data Transfer Out.
-   Additional charges for DAX, Global Tables, On-demand Backups (per GB), Continuous backups and point-in-time recovery (per GB), Table Restorations (per GB), and Streams (read request units).


#### Extra {#extra}

-   There is an initial limit of 256 tables per region.


### DocumentDB {#documentdb}

Fully managed document database service designed to be fast, scalable, and highly available

-   Stores JSON-like documents.
-   Compatible with MongoDB
-   Flexible schema and indexing.
-   Useful for: content management, catalogs, user profiles.


### Elasticache {#elasticache}

Distributed in-memory cache for Redis and Memcached engines.

-   **IMPORTANT:** For Redis you can enable auth-token parameter which needs to be sent with all subsequent commands for the cluster.
-   **IMPORTANT:** Usually used for dynamic websites.
-   **IMPORTANT:** Memcached does not support HA or automatic cluster failover. User Redis instead.

-   Memcached is used for simple solutions with string only data types.
-   Redis for more complex solutions with hash, maps, etc data types.

{{< figure src="./img/elasticache_redis_vs_memcached.png" >}}

{{< figure src="./img/elasticache_caching.png" >}}

{{< figure src="./img/elasticache_session_data.png" >}}


### MemoryDB for Redis {#memorydb-for-redis}

In-memory database service for microservices-based applications for ultra fast performance.

-   Aims to replace cached and database in one component


### Keyspaces {#keyspaces}

Wide column database compatible with Apache Cassandra.

-   Used for high-scale apps with top-tier performance.


### Neptune {#neptune}

Fully managed graph database service used for building applications that work with highly connected datasets.

-   Runs in a VPC, private by default
-   Can be multi AZ &amp; scales via read replicas
-   Self-healing storage. Continuous backups to s3 and has point in time recovery.
-   Asynchronous replication from primary instance to read replicas.
-   Use cases: graph styled data, social media (anything involving fluid relationships), fraud prevention, recommendation engines, network and it operations, biology and other life sciences


### Timestreams {#timestreams}

Time series database for IoT.

-   **IMPORTANT:** Use scheduled queries to define real-time analysis.

-   Replicated in multiple AZs in a region.
-   Retention policies used to move data from the memory store to the magnetic store.

-   Memory store: suitable for high throughput write and fast point-in-time queries.
-   Magnetic store: suitable for low throughput writes and fast analytical queries along with long-term data storage.


### QLDB (Quantum Ledger DB) {#qldb--quantum-ledger-db}

Immutable append-only ledger serverless database

-   Cryptographically verifiable transaction log and transparent with full history always accessible.
-   3 AZ resilience &amp; replication within each AZ
-   Can stream data to Amazon Kinesis
-   Document DB model with ACID, which uses PartiQL as a query language.
-   Used for: data where its integrity is really important (finance, medical, logistics, legal)

{{< figure src="./img/qldb.png" >}}


## Migrations {#migrations}


### Migration Strategies {#migration-strategies}

Retire(simplest) &lt; Retain &lt; Relocate &lt; Rehost &lt; Repurchase &lt; Replatform &lt; Re-architect/Refactor (most complex)

{{< figure src="./img/migration_flowchart.png" >}}

{{< figure src="./img/migration_diagram.png" >}}


#### Rehost (lift and shift) {#rehost--lift-and-shift}

Move to AWS without changes

-   Advantages: reduce admin overhead, potentially easier to optimize, cost savings
-   Disadvantages: not taking / delaying full advantage of the cloud
-   Tools: VM Import/Export, SMS


#### Replatform (lift, tinker, and shift) {#replatform--lift-tinker-and-shift}

-   Few cloud optimizations without changing the core architecture of the app.

-   Advantages: reduce admin overhead, performance benefits, more effective backups, or improved HA/FT (fault tolerance)
-   Examples: RDS, Elastic Beanstalk


#### Repurchase (drop and shop) {#repurchase--drop-and-shop}

Move to a SaaS model to use a service product

-   Tools: AWS Marketplace


#### Refactor / Re-architect {#refactor-re-architect}

Redesign the app using cloud-native features.

-   Advantages: best long-term benefits, often cheaper, much more scalable, better HA/FT, cost aligned with app usage
-   Disadvantages: initially very expensive &amp; time consuming
-   Example: use service-oriented or microservices, APIs, Event-Driven or serverless


#### Relocate {#relocate}

Move from proprietary virtualization platform from on-premise to the cloud

-   Advantages: reduce operational complexity


#### Retire {#retire}

Turn off no longer useful apps.


#### Retain {#retain}

Do not do anything

-   Used for old apps which are not worth the move, complex applications (leave until later), super important apps (risky)


### Migration Hub {#migration-hub}

Single location plan, orchestrate, and track app migrations to AWS.

-   Strategy recommendations: by analyzing the app and determine the best strategy.
-   Orchestrator: automates and simplifies app migration (dashboard for monitoring the status and metrics of the migration)
-   Home region: region to store all data and where to orchestrate the migration


### Application Discovery Service {#application-discovery-service}

Plan the migration to AWS by collecting usage info and config data about on-premises servers and dbs.

-   The Discovery connector send data to the Application discovery service.
-   All discovered data is stored encrypted in the Migration Hub (MH) home region (you set it through MH console or CLI).
    -   Data can be exported as a CSV to estimate the Total Cost of Ownership (TCO) of running on AWS and plan the migration.
-   Uses service-linked roles to manage the necessary permissions.


#### Agentless Connector {#agentless-connector}

Gather basic server information in VMware virtualized environments.

-   OVA file installed in a VMware vCenter
-   Collects static config data: server hostnames, ip, mac address, disk resource allocation, db engine version, db schemas
-   Collects average and peak utilization: CPU, RAM, Disk I/O.

<!--list-separator-->

-  Prerequisites

    -   Update on-premises firewall to allow outbound access to AWS domains (i.e. arsenal-discovery.us-west-2.amazonaws.com)
    -   Create IAM user with policy "AWSApplicationDiscoveryAgentlessCollectorAccess".
        -   **You cannot attach a role to Agentless Connector.**


#### Agent-Based Discovery {#agent-based-discovery}

Deployed AWS Application Discovery Agent on each of your VMs and physical servers.

-   Collects detailed and comprehensive data: network dependencies and service environments.
-   Collects static config data: detailed time-series system-performance info, inbound and outbound network connections, and processes that are running.

<!--list-separator-->

-  Prerequisites

    -   Download agent installation script
    -   Create a IAM user with "AWSApplicaitonDiscoveryAgentAccess".


#### Data Exploration in Amazon Athena {#data-exploration-in-amazon-athena}

Analyze data collected from all discovered on-premises services

-   Enabled from the Migration Hub or bu using StartContinousExport API
-   Collected data is automatically stored in a S3 bucket at regular intervals.


### MGN (Application Migration Service) {#mgn--application-migration-service}

Highly automated **lift-and-shift (rehost)** solution that simplifies, expedites, and reduces the cost of migrating applications to AWS.

-   Application-centric: replicate entire application stack with auto-gen CF templates.
-   Continuous data replication: real-time or near-real-time copying of data.
-   Automated cutover.
-   Replication Agent used to orchestrate the migration.


### SMS (Server Migration Service) (Old) {#sms--server-migration-service----old}

Agentless service to migrate the whole VM as is (OS, data, apps, etc) to AWS

-   **IMPORTANT:** Cannot dump server files to S3.
-   **IMPORTANT:** Can only migrate VMs not physical servers.

-   Server-centric: migrate a large number of VMs, prioritizing individual servers as the primary migration unit.
-   Automate, schedule, and track incremental replication of **live server volumes** (migrate services running live)
-   Each replicated volume is saved as an AMI which can be launched as an EC2 instance.
-   Incremental replication: replicate changes only made since the last replication.
-   Resource consolidation: group multiple VMs into a single instance.

{{< figure src="./img/sms.png" >}}


#### Extra {#extra}

-   Agentless, uses a connector (on-premise VM machine)
-   Integrates with VMware, Hyper-V and AzureVM
-   New EBS snapshot with every replication.
-   Replication of on-premise services up to 90 days. Can be increased by submitting a request.
-   Migrate up to 16TB volumes.


### DMS (Database Migration Service) {#dms--database-migration-service}

Managed database migration service for relational, NoSQL databases, data warehouses, and other types of data stores between combinations of cloud and on-premises setups (one must be on AWS).

-   **IMPORTANT**: If AWS DMS console is used, DMS creates the required IAM roles and policies automatically. If CLI or API is used, IAM roles and policies must be created manually.
-   **IMPORTANT:** Can encrypt the data with KMS in the replication instance. Can use aws/dms default key or a CMK.

-   Used if migrations need to track changes, complex, change of engines, minimize downtime

{{< figure src="./img/dms.png" >}}


#### SC &amp; SCT (Schema Conversion &amp; Schema Conversion Tool) {#sc-and-sct--schema-conversion-and-schema-conversion-tool}

Analysis, recommendation, and conversion of the schema of a DB during migrations

-   **IMPORANT**: Used when converting one database engine to another including DB to S3, not if they are the same type.

{{< figure src="./img/dms_sc_and_sct.png" >}}


#### Extra {#extra}

-   Is a server (EC2) in the AWS Cloud that runs replication software from a source to a destination endpoint.
-   For multiple TBs, DMS can be used with Snowball. It uses SCT to extract the data locally to be moved to S3 over the Snowball device.

-   Types of jobs:
    -   Full load: one off migration of all data
    -   CDC (Change Data Capture): just track changes and perform the bulk migration with other tools
    -   Full load + CDC: full migration and track changes

-   When migrating to Redshift, DMS first moves data to S3. Then, it is transferred to tables in the Redshift cluster.
    -   Redshift and S3 must be in the same region
    -   Don't use S3 versioning. If needed, use lifecycle policies to delete old versions.
    -   Enable inbound access for SG, subnet CIDR range, or Ip address of replication instances in Redshift SGs
    -   Does not support custom DNS names for Redshift clusters, need to use Amazon provided DNS name.


### DataSync {#datasync}

**Online data transfer** service that simplifies, automates, and accelerates moving data to and from AWS storage services.

-   Copy data between NFS, SMB, HDFS, S3, EFS, FSx, and cloud providers.
-   S3 storage classes supported for ingestion.

-   **IMPORTANT**: To move data into VPCs, it supports VPC endpoints (powered by AWS PrivateLink).

{{< figure src="./img/datasync.png" >}}


#### Extra {#extra}

-   Fully managed service, with per GB cost for data moved pricing.
-   Built in data validation and automatic integrity checks, that keeps metadata (permissions and timestamps)
-   Purpose-built network protocol and a parallel, multi-threaded architecture to accelerate your transfers.
-   Incremental and scheduled transfers options
-   Automatic recovery from transit errors
-   Scalable (10Gbps per agent), with bandwidth limiters
-   Only stored data in DynamoDB of details needed to complete the transfer.

-   DataSync Agent: VM agent which communicates with the AWS DataSync Endpoint and connect to the storage with NFS or SMB
-   Task: job which defines what is being sync, how quickly, from where and to where.
-   Task execution:  individual run of a task, which includes options such as start time, end time, bytes written, and status.
    -   Phases: queuing, launching, preparing, transferring, verifying, success/failure.


### Snowball Family {#snowball-family}

Physical storage suitcase or truck useful to more large amounts of data in and out of AWS.

-   **IMPORTANT:** Has a typical 7 days turnaround time. As a rule of thumb, S3 Transfer Acceleration over a fully-utilized 1Gbps line can transfer up to 75TBs in the same time period.

-   Can be ordered from aws empty or with data.
-   Any data in the Snowball is encrypted with KMS
-   To improve the transfer speed from data sources to the Snowball ordered from largest to smallest positive impact on performance:
    1.  Use the latest Mac or Linux Snowball client
    2.  Batch small files together
    3.  Perform multiple copy operations at one time
    4.  Copy from multiple workstations
    5.  Transfer directories, not files


#### Snowball {#snowball}

Undertake local processing and edge-computing workloads in addition to transferring data between local environments and the cloud.

-   **IMPORTANT:** Useful when you need to move data from 10Tb to 10PB.

-   Only for storage no compute, it is the older generation.
-   50TB and 80TB capacity, with 1Gbps or 10Gbps network

<!--list-separator-->

-  Snowball Edge

    -   Newer generation of Snowball devices.
    -   Has on-board S3-compatible storage and compute to support running Lambda functions and EC2 instances.
    -   Used for data processing when ingesting, high capacity requirements or need faster network.

    -   Types
        -   Storage Optimized: transfer up to 100TBs with a single device.
        -   Compute Optimized: use to perform data analytics or transformations before loading the data.
        -   Compute with GPU: same as the compute optimized with GPU capabilities.


#### Snowmobile {#snowmobile}

Portable data center within a shipping container on a truck (special order) .

-   **IMPORTANT:** Used for single location when more than 10PB, up to 100PB per Snowmobile.

-   Single truck, not economical to small data or multi site.


## Networking {#networking}


### Public and Private Services {#public-and-private-services}

-   Public Service: service that has a public endpoint from the networking perspective (i.e. S3, CloudFront).
-   Private Service: service that runs withing a VPC (i.e. EC2, RDS).

{{< figure src="./img/services_types_networking.png" >}}


### VPC (Virtual Private Cloud) {#vpc--virtual-private-cloud}

Virtual network in the cloud dedicated to your AWS account where you can launch AWS resources

-   **IMPORTANT:** To maintain redundancy and fault tolerance, create at least 2 subnets configured in 2 AZs.
-   **IMPORTANT:** To expand the CIDR block of a VPC, you can add a up to 4 secondary CIDR range to it.
    -   Secondary CIDR ranges can be disassociated, but not the primary.

-   Allows to specify an IP address range for the VPC, add subnets, associate security groups, and configure route tables.
-   Good practice is a VPC with /16 and subnets with /24.

-   Virtual Private Gateway: VPN endpoint on the VPC side of a site-to-site VPN connection. Can be attached to a single VPC.


#### Networking Components {#networking-components}

<!--list-separator-->

-  Route Tables

    Set of rules, called routes, that are used to determine where network traffic is directed.

    -   A subnet can only be associated with 1 route table at a time.
        -   If you need more than 1 route table, create multiple subnets.
    -   Cannot delete the main route table, but you can replace the main route table with a custom.
    -   Must update the route table for any subnet that uses gateways or connections.
    -   Longest prefix match: uses the most specific route in the route table that matches the traffic to determine how to route the traffic.

<!--list-separator-->

-  Subnets

    -   **IMPORTANT:** A subnet can only have one route table. If you need more route tables, create more subnets.
    -   **IMPORTANT:** First four IP addresses and the last IP address in each subnet CIDR block are NOT available.

    -   A subnet resides in a specific AZ, multiple subnets can be created in one AZ.
    -   Specify the CIDR block for a subnet, which is a subset of the VPC CIDR block. It must no overlap with any existing CIDR.
        -   Subnets are allowed to be from /16 to /28.
        -   Cannot increase or decrease the size of an existing CIDR block.

    -   Types of Subnets
        -   Public Subnet: has an internet gateway
        -   Private Subnet: doesn't have an internet gateway
        -   VPN-only Subnet: has a virtual private gateway instead

<!--list-separator-->

-  Network Interfaces

    They are a virtual network interface that can be attached and detached from instances. However, the primary network interface cannot be detached.

    They can include:

    -   Primary private IPv4 address
    -   One or more secondary private IPv4 addresses
    -   One Elastic IP address per private IPv4 address
    -   One public IPv4 address, which can be auto-assigned to the network interface for eth0 when you launch an instance
    -   One or more IPv6 addresses
    -   One or more security groups
    -   MAC address
    -   Source/destination check flag
    -   Description

<!--list-separator-->

-  Elastic IP Addresses

    Static, public IPv4 address.

    -   Can be associated with any instance or network interface for any VPC in your account.
    -   Can mask the failure of an instance by rapidly remapping the address to another instance in your VPC.
    -   Remain associated with the AWS account until you explicitly release them.
    -   Charges per Elastic IP.
    -   Limited to five Elastic IP addresses.

<!--list-separator-->

-  NACL (Network Access Control Lists)

    Stateless firewall to control inbound and outbound traffic for your subnets.

    -   **IMPORTANT:** The default NACL is configured to allow all traffic to flow in and out of the subnets to which it is associated.
    -   **IMPORTANT:** If you have a NAT Gateway, ELB or a Lambda function in a VPC, you need to allow 1024-65535 port range.

    -   A subnet must be associated to only one NACL. Automatically associated with the default NACL.
    -   Does not understand the state of the connection, the request and response are two individual and independent parts.
    -   Contains a numbered list of rules that is evaluated in order, starting with the lowest numbered rule.
    -   For custom ACLs, you need to add a rule for ephemeral ports, (32768-65535).

    {{< figure src="./img/stateless_firewalls.png" >}}

    {{< figure src="./img/nacl_firewalls.png" >}}

<!--list-separator-->

-  SG (Security Groups)

    Stateful firewalls to control inbound and outbound traffic for network interfaces.

    -   **IMPORTANT:** The default SG allow inbound traffic from network interfaces that are  assigned to the same SG and all outbound traffic

    -   Associate up to five SG to a network interface.
    -   There is no explicit deny, only allow or implicit deny. Cannot be used to block specific bad actors.
    -   Can be applied up to L7, including security groups and itself.

    {{< figure src="./img/statefull_firewalls.png" >}}

    -   Logical References: allows high scalability as we can reference security groups from others.
        ![](./img/logical_references_security_groups.png)

    -   Self References: allow traffic from the same security group.
        ![](./img/self_references_security_groups.png)

<!--list-separator-->

-  Internet Gateways

    Allows communication between instances in your VPC and the internet.

    -   Performs network address translation for instances that have been assigned public IPv4 addresses.
    -   To enable access to or from the Internet for instances in a VPC subnet:
        -   Attach an Internet Gateway to the VPC
        -   Ensure that the subnet's RT points to the Internet Gateway.
        -   Ensure that instances in the subnet have a globally unique IP address (public IPv4 address, Elastic IP address, or IPv6 address).
        -   Ensure that the NACL and SG rules allow the relevant traffic to flow to and from your instance

    <!--list-separator-->

    -  Egress-Only Internet Gateways

        Allows outbound communication over IPv6 from instances in your VPC to the Internet, and prevents the Internet from initiating an IPv6 connection with your instances.

        -   Stateful.
        -   Cannot associate a SG with an egress-only Internet gateway.
        -   Can use a NACL to control the traffic to and from the subnet for which the egress-only Internet gateway routes traffic.

<!--list-separator-->

-  VPC Router

    Virtual router within a VPC. It is what AWS uses to route traffic withing a VPC.

    -   HA across all AZs in that region, and scalable.
    -   Routers traffic between subnets, from external nets into the VPC and vice versa.
    -   Interface in every subnet (first IP address in each subnet after the network address).

<!--list-separator-->

-  NAT

    Enable instances in a private subnet to connect to the internet or other AWS services, but prevent the internet from initiating connections with the instances.

    -   **IMPORTANT:** Used to restrict inbound connections from the internet but allow outbound connections.
        -   If you want to allow inbound connections but restrict outbound connections, use **web proxy servers**.

    -   NAT Gateways:
        -   Reside in public subnets and are associated an Elastic IP.
        -   Created in a specific AZ and implemented with redundancy in that zone.
        -   Supports TCP, UDP, and ICMP.
        -   Cannot associate a security group with a NAT gateway.
        -   Cannot send traffic over VPC endpoints, VPN connections, AWS Direct Connect, or VPC peering connections.
        -   Uses ports 1024-65535. Make sure to enable these in the inbound rules of your network ACL.

    -   NAT Instances: EC2 instances in public subnets that route traffic and act as a NAT middleware.

<!--list-separator-->

-  DNS

    -   **IMPORTANT:** Set VPC attributes "enableDnsHostnames" and "enableDnsSupport" to true.

    -   Provides instances launched in a default VPC with public and private DNS hostnames that correspond to the public IPv4 and private IPv4 addresses for the instance.
    -   Provides instances launched in a non-default VPC with private DNS hostname and possibly a public DNS hostname, depending on the DNS attributes you specify for the VPC and if your instance has a public IPv4 address.
    -   In a VPC, the DNS is accessed via the VPC .2 address

<!--list-separator-->

-  DHCP (Dynamic Host Configuration Protocol)

    Provides a standard for passing configuration information to hosts on a TCP/IP network.

    -   Can assign a custom domain name to instances, and use up to four DNS servers by specifying a special set of DHCP options to use with the VPC.
    -   Creating a VPC automatically creates a set of DHCP options, which are domain-name-servers=AmazonProvidedDNS, and domain-name=domain-name-for-your-region, and associates them with the VPC.
    -   After you create a set of DHCP options, you can’t modify them.

    {{< figure src="./img/dhcp_in_vpcs.png" >}}


#### Routing {#routing}

-   **IMPORTANT:** To allow instances inside the VPC to initiate outbound connections to the internet but prevent unsolicited inbound connections:
    -   For IPv4, Use a NAT gateway or a NAT instance.
    -   For IPv6, use an egress-only internet gateway.

-   Optionally associate an Amazon-provided IPv6 CIDR block and assign IPv6 addresses to your instances.
    -   IPv6 traffic is separate from IPv4 traffic; your route tables must include separate routes for IPv6 traffic.
-   Static routes have priority over propagated routes if they have the same prefix.
-   Ingress routing: gateway routing tables can be used to direct a gateway to take actions on inbound traffic.
    ![](./img/vpc_advanced_routing_ingress_routing.png)

{{< figure src="./img/vpc_advanced_routing.png" >}}

<!--list-separator-->

-  To The Internet

    -   Services never have public IPv4 addressing configured on them within a VPC. They are handled by the IGW.
    -   Internet Gateway: it is the door to connect the VPC to the internet
        -   Only one internet gateway can be attached to one VPC (1 to 1)
        -   You cannot block IP addresses from the IGW

<!--list-separator-->

-  BGP (Border Gateway Protocol)

    -   Autonomous system, where routers are controlled by one entity.
    -   ASN are unique and allocated by IANA (0-65535), (64512-65535 are private) (use to know and differentiate different AS)
    -   Operates over tcp/179.
    -   No automatic-peering, it is manually configured.
    -   Is a path-vector protocol, exchanges the best path to a destination between peers, this path is known as ASPATH (autonomous system path).
    -   Doesn't care about latency or bandwidth
    -   You can use AS path prepending to make paths longer so they are not preferred.

    -   iBGP (Internal BPG) routing within an AS
    -   eBGP (external BPG) routing between AS

    {{< figure src="./img/bgp.png" >}}

<!--list-separator-->

-  Traffic Mirroring

    Replicate the network traffic from EC2 instances within the VPC to security and monitoring appliances for content inspection, threat monitoring, troubleshooting, and more.

    -   Both Nitro and non-Nitro instances are supported.


#### Endpoints {#endpoints}

Privately connect a VPC to supported AWS services and VPC endpoint services without requiring an internet gateway, NAT device, VPN connection, or AWS Direct Connect connection.

-   **IMPORTANT:** Supports IPv4 TCP traffic only.
-   **IMPORTANT:** Must enable DNS resolution in the VPC.
-   **IMPORTANT:** Can create your own application in your VPC and configure it as an AWS PrivateLink-powered service (referred to as an endpoint service).
    -   You are the service provider, and the AWS principals that create connections to your service are service consumers.

-   Endpoints are virtual devices.
-   Regional service.

<!--list-separator-->

-  Gateway Endpoints

    Provide private access to S3 and DynamoDB (public resources without needing public IPs or NATS)

    -   **IMPORTANT:** Used for S3 and DynamoDB only. Only supported gateway for DynamoDB.
    -   **IMPORTANT:** HA across all AZs in a region by default

    -   Does not use PrivateLink
    -   Prefix List added to route table (represents the public resources IPs)
    -   Prevent Leaky Buckets by allowing only access from the gateway endpoint.
    -   Can only access from services inside of the VPC

    {{< figure src="./img/gateway_endpoint.png" >}}

    {{< figure src="./img/s3_gateway_interface_endpoints.png" >}}

<!--list-separator-->

-  Interface Endpoints

    EIN with a private IP address that serves as an entry point for traffic destined to a supported service.

    -   **IMPORTANT:** Uses PrivateLink where PrivateDNS overrides the default DNS for services (enabled by default)
    -   **IMPORTANT:** Cannot be used with DynamoDB.
    -   **IMPORTANT:** Cannot be used to access an internal load balancer.

    -   Can be accessed through AWS VPN connections or AWS Direct Connect connections, through intra-region VPC peering connections.
    -   For each interface endpoint, you can choose only one subnet per AZ.
    -   Endpoints are supported within the same region only.
    -   Network access controlled via Security Groups

    {{< figure src="./img/interface_endpoint.png" >}}

<!--list-separator-->

-  Endpoint Policies

    Control the principal and the actions allowed (restrict to specific buckets for example)

    -   By default they allow access to an entire service in a region.
    -   Only limits access to that endpoint only.
    -   Contains a principal and conditions.
    -   Usually used to limit what private VPCs can access.

    {{< figure src="./img/endpoint_policies.png" >}}


#### IPv6 {#ipv6}

-   **IMPORTANT:** Every IPv6 address used in a VPC is publicly routable (NAT is not used in IPv6).
-   **IMPORTANT:** Also IPv6 must be configured on services, but not everything has support for IPv6 such as (PrivateLink, Interface Endpoints, or NAT)

-   IPv6 must be enabled (it is not by default).
-   Routing for each IPv4 and IPv6 is handled differently.
-   To make only outbound traffic available in IPv6 as of NAT, you need to add a Egress Only IGW.
-   IGW can only be one per VPC, but Egress Only IGW is a different type so you can have both in the same VPC.
-   IPv6 Addressing can be enabled after creating the VPC.

{{< figure src="./img/VPC_IPv6.png" >}}


#### VPN {#vpn}

-   **IMPORTANT:** VGW with VPN is discouraged is best to attached the VPN to a TGW

A VPN connection consists of:

-   Virtual private gateway (which is the VPN concentrator on the Amazon side of the VPN connection) attached to your VPC.
-   Customer gateway (which is a physical device or software appliance on your side of the VPN connection) located in your data center.
-   A diagram of the connection

<!--list-separator-->

-  Site-To-Site VPN

    Logical connection between VPNC and on-premise network encrypted using IPSec running over the public internet

    -   **IMPORTANT:** Can be used as a backup for Direct Connect (DX) or used with it to set up initial connection as it is fast.

    -   It is HA if designed properly. It creates an IPsec VPN connection between VPC and a remote network.
        -   On the AWS side of the VPN connection, a VGW provides two VPN endpoints (tunnels) for automatic failover.
        -   You configure your CGW on the remote side of the VPN connection.
    -   Connections can be moved from a VGW to an TGW without having to make any changes on the CGW.

    -   Quick provision, less than 1 hour.
    -   Latency considerations as they go though the public internet.
    -   AWS hourly cost, GB out cost and data cap (on premise).

    {{< figure src="./img/aws_site_to_site_vpn_types.png" >}}

    -   Partial Highly Available
        ![](./img/aws_site_to_site_vpn_partial_HA.png)

    -   Fully Highly Available
        ![](./img/aws_site_to_site_vpn_fully_HA.png)

    <!--list-separator-->

    -  Accelerated Site-To-Site VPN

        Uses the AWS Global Accelerator network to speed up.

        -   **IMPORTANT:** Can only be enabled when creating a TGW VPN attachment only, not with VGW.

        -   Low latency, less jitter and higher throughput.
        -   Pricing: fixed accelerator cost plus a transfer fee

        <!--list-separator-->

        -  IPSEC Tunnels

            -   As this is going though the AWS Global Accelerator Network, it will create two tunnels, one for each endpoint
            -   There will be two IPs per endpoint (one public and one private)

            {{< figure src="./img/aws_accelerated_site_to_site_ipsec_tunnels.png" >}}

<!--list-separator-->

-  VPN CloudHub

    Hub-and-spoke VPN that you can use with or without a VPC.

    -   **IMPORTANT:** Used if you have more than one remote network, and want multiple AWS-managed VPN connections to enable communication between these networks.
    -   **IMPORTANT:** The remote sites must not have overlapping IP ranges.

    -   Uses an VGW with multiple CGW, each using unique BGP autonomous system numbers (ASNs).
    -   Allow the connection between the different on-premises networks.

    {{< figure src="./img/vpn_cloud_hub.png" >}}

<!--list-separator-->

-  Client VPN

    Managed implementation of OpenVPN.

    -   Connect to a client VPN endpoint associated to one VPC.
    -   Can have more than 1 target networks for HA.
    -   Billed based on network associations

    {{< figure src="./img/aws_client_vpn.png" >}}

    <!--list-separator-->

    -  Split Tunnel

        Route traffic through different routes.

        -   Use when you don't want all traffic going through the VPN (i.e. internet and company access).
        -   It is not the default

        {{< figure src="./img/aws_client_vpn_split_tunnel.png" >}}


#### Private Link {#private-link}

Connect privately a VPC to supported AWS services, services hosted by other AWS accounts.

-   **IMPORTANT:** Endpoints can be accessed across both intra- and inter-region VPC peering connections.
-   **IMPORTANT:** Doesn't require an IGW, NAT device, public IP address, AWS Direct Connect connection, or VPN.
    -   Traffic between your VPC and the service does not leave the Amazon network.

-   Can configure a services as a AWS PrivateLink-powered service (referred to as an endpoint service).
    -   Other AWS principals can create a connection from their VPC to the endpoint service using an interface VPC endpoint or a Gateway Load Balancer endpoint
-   IPv4 and TCP only (IPv6 is not currently supported)
-   Private DNS is supported (with verified domains)
-   Direct Connect, Site-to-Site VPN and VPC Peering are supported

{{< figure src="./img/aws_privatelink.png" >}}


#### VPC Peering {#vpc-peering}

Networking connection between two VPCs that enables to route traffic between them privately using private IPv4 addresses or IPv6 addresses.

-   Instances in either VPC can communicate with each other as if they are within the same network.

-   You can create a VPC peering connection between your own VPCs, or with a VPC in another AWS account.
    -   The VPCs can be in different Regions (also known as an inter-Region VPC peering connection).
-   It is neither a gateway nor a AWS Site-to-Site VPN connection, and does not rely on a separate piece of physical hardware. There is no single point of failure for communication or a bandwidth bottleneck.
-   If the VPCs are in the same region, you can enable the resources on either side of a VPC peering connection to communicate with each other over IPv6.

-   Not supported:
    -   Does NOT support edge-to-edge routing. You can create multiple VPC peering connections for each VPC that you own, but transitive peering relationships are not supported.
    -   Cannot create a VPC peering connection between VPCs that have matching or overlapping IPv4 or IPv6 CIDR blocks.
    -   Cannot have more than one VPC peering connection between the same two VPCs at the same time.
    -   Unicast reverse path forwarding in VPC peering connections is not supported.
    -   For inter-region peering, you cannot create a security group rule that references a peer VPC security group. Communication over IPv6 is not supported as well.


#### VPC Sharing {#vpc-sharing}

Allows multiple AWS accounts to create their application resources  into shared, centrally-managed VPC.

-   **IMPORTANT:** The account that owns the VPC (owner) shares one or more subnets with other accounts (participants) that belong to the same organization.

-   After a subnet is shared, the participants can view, create, modify, and delete their application resources in the subnets shared with them.
-   Participants cannot view, modify, or delete resources that belong to other participants or the VPC owner.


#### VPC Flow Logs {#vpc-flow-logs}

Capture information about the IP traffic going to and from network interfaces in a VPC that is **published to CloudWatch Logs**.

-   **IMPORTANT**: VPC Flow Logs cannot be used to inspect the network packets.
    -   If need to capture content, you need a packet sniffer or mirror the traffic to a network monitoring program.

-   After creating, can take several minutes to begin collecting. **Do not capture real-time log streams**.
-   Can be sent directly to S3, CW logs or Kinesis Data Firehose.
-   Used for:
    -   Diagnosing overly restrictive security group rules.
    -   Monitoring the traffic that is reaching your instance.
    -   Determining the direction of the traffic to and from the network interfaces.

{{< figure src="./img/vpc_flow_logs.png" >}}


### DX (Direct Connect) {#dx--direct-connect}

Create a **dedicated private physical connection** from a remote network to your VPC.

-   **IMPORTANT:** Used for low &amp; consistent latency + high speeds (best for high speeds in hybrid networks)
-   **IMPORTANT:** Takes time as physical cables must be added and there is no resilience.

-   Can combine this connection with a VPN connection to create an IPsec-encrypted connection.
-   On-premises site =&gt; DX Location =&gt; AWS Region
-   Autonomous System numbers (ASN) are used to identify networks that present a clearly defined external routing policy to the Internet.
-   Router must support BGP and BGP MD5 Authentication
-   Optional config: MACsec and Bidirectional Forwarding Detection (BFD)

{{< figure src="./img/aws_direct_connect.png" >}}

{{< figure src="./img/aws_direct_connect_resilience.png" >}}

{{< figure src="./img/aws_direct_connect_BGP_sessions_VLAN.png" >}}


#### Cross Connects {#cross-connects}

-   In order to connect the AWS cage to the customer cage they need a Letter of Authorization Customer Facility Access (LOA-CFA)

{{< figure src="./img/aws_direct_connect_connection_process.png" >}}


#### VIF (Virtual Interface) {#vif--virtual-interface}

They are networking interfaces to that enable AWS to interact with Direct Connect connections.

-   A single DX Connection can have up to 50 public and 50 private VIFs and 1 transit VIF

<!--list-separator-->

-  Public VIFS

    Connect to AWS resources that are reachable by a publich IP address

    -   **IMPORTANT:** Running an IPSec VPN over the top of a DX connection it is necessary to use a public VIF.
        -   As it needs to connect to the AWS VGW IPsec endpoint.
    -   **IMPORTANT:** Can access all public zone regions, across the AWS global network

    -   Not transitive, your prefixes don't leave AWS.
    -   AWS advertises all AWS public IP ranges to you over the public VIF even the public IPs you own.
    -   China is set up separate from the AWS global region and it is excluded by default.

<!--list-separator-->

-  Private VIFS

    Connect to your resources hosted in a VPC using their private IP addresses.

    -   **IMPORTANT:** You need one private VIF for each VPC to connect to from the DX connection.
        -   Can also be connected to a DXGW to multiple VPCs. (Take care usually a transit VIF is used with TGW to have transit networking and multiple VPCs in the same region).
    -   **IMPORTANT:** To allow connectivity to public AWS services from your on-premises network.
        -   Need to allow in the SG of the interface endpoint connectivity to AWS services.

    -   Used in a DX connection to access 1 VPC using private IPs.
    -   Attached to a VGWs - 1 VPC only in the same region as the DX location terminates in
    -   No encryption, but apps can layer on encryption (HTTPS)
    -   If using VGW, route propagation is enabled by default.

    {{< figure src="./img/aws_direct_connect_private_vif.png" >}}

<!--list-separator-->

-  Transit VIFS

    Connect to resources hostes in a VPC using private IPs through a transit gateway.

    -   **IMPORTANT:** Used to connect multiple VPCs in the same region with a DX connection through a DXGW.
    -   **IMPORTANT:** Used to allow communication between two on-premises networks though the AWS network
        ![](./img/aws_direct_connect_transit_vif_cross_location.png)

    -   Only 1 per DX connection
    -   Can only be connected to up to 3 TGWs.
    -   An individual DXGW can be connected to (VPCs and private VIFS) or (TGW and transit VIFs) not both.
    -   1 TGW can be attached to up to 20 DXGW
    -   1 TGW supports 5000 attachments and 50 peering attachments (for each peered TGW allows 5k attachments)

    {{< figure src="./img/aws_direct_connect_transit_vif.png" >}}


#### SiteLink {#sitelink}

Can link your on-premises data centers to Direct Connect and send data between them over the shortest path between your AWS Direct Connect locations.

-   Done by connecting your AWS resources to Direct Connect locations around the globe.


#### MACSec {#macsec}

-   Standard for frames encryption (layer 2)
-   St is hop by hop, between two switches or routers
-   As it is not end to end, it does not replace ipsec over dx

{{< figure src="./img/aws_direct_connect_macsec_packet.png" >}}

{{< figure src="./img/aws_direct_connect_macsec_infrastructure.png" >}}


### DXGW (Direct Connect Gateway) {#dxgw--direct-connect-gateway}

Connect your Direct Connect connection over a private VIFs to one or more VPCs in the same or different Regions.

-   **IMPORTANT:** Does not route between attachments, that is why DXGW + TGW + transit VIFs are used.

-   Globally available resource, accessible to from all regions.
-   1 private VIF = 1 DGW + 10 VGW per DXGW
-   1 DX can have 50 private VIFs = 50 DXGW = 500 VPCs, and also 1 transit VIF

{{< figure src="./img/aws_direct_connect_gateways.png" >}}

{{< figure src="./img/aws_direct_connect_gateways_routing_problem.png" >}}


#### Multi-Account Support {#multi-account-support}

Associate up to 10 VPCs from multiple accounts with a DXGW.

-   The VPCs must be owned by accounts that belong to the same AWS payer account ID.
-   They work cross account using a association proposal

{{< figure src="./img/aws_direct_connect_gateways_cross_account.png" >}}


#### LAG (Link Aggregation Groups) {#lag--link-aggregation-groups}

Multiple Direct Connect Connection to act as one (speed \* n)

-   Is not a resilience component, it is just used to speed up the connection.
-   Maximum of 2 connections if using 100Gbps or 4 connections if 10 or 1 Gbps.
-   All connections need to be the same speed and terminate at the same DX location.

{{< figure src="./img/aws_direct_connect_lag.png" >}}


#### Pricing {#pricing}

-   Pay only for the network ports you use and the data you transfer over the connection.
-   Pricing is per port-hour consumed for each port type.
    -   Data transfer out over AWS Direct Connect is charged per GB.
    -   Data transfer IN is $0.00 per GB in all locations.


### TGW (Transit Gateway) {#tgw--transit-gateway}

Network transit hub to connect VPCs and on-premises networks to a single gateway

-   **IMPORTANT:** In order to have a load balance for the egress only appliances:
    -   VPN attachment with BPG must be used. This allows BGP equal-cost multipathing (ECMP) which can load balance between appliances.
-   **IMPORTANT:** 2 TGW in the same region cannot be peered.

-   Regional service with HA and scalable.
-   When VPCs are added, they become available to every other network that is connected to the TGW.
-   Used to create a full mesh topology between on-premises networks and VPCs.
-   They have replaced the transit VPCs.
-   Can be shared with other AWS accounts with AWS RAM.

{{< figure src="./img/transit_gateways.png" >}}


#### Peering Attachments {#peering-attachments}

Attache network resources both intra and inter region to route traffic between them.

-   Need static pairs to make networking function (no route learning or propagation across peers).
-   Use unique ASNs for future route propagation features
-   Max 50 peering attachments per TGW (they can be in different regions &amp; accounts).

{{< figure src="./img/transit_gateways_peering_attachments.png" >}}


#### Multicast &amp; Isolated Routing {#multicast-and-isolated-routing}

-   Multicasting can be enabled (disaled by default).
-   Isolated routing used to make network traffic isolated.

{{< figure src="./img/transit_gateways_isolated_routing.png" >}}


### Global Accelerator {#global-accelerator}

Improve the availability and performance of applications to local and global users.

-   **IMPORTANT:** Provides static IP addresses that act as a fixed entry point to a single or multiple regions.
-   **IMPORTANT:** Can only be connected to Application/Network LB, EC2 instances or Elastic IPs.
-   **IMPORTANT:** No variability around clients that cache IP addresses.

-   Works on any **TCP/UDP connection**.
-   Once an edge location is reached, it forwards the data to the AWS region though the **AWS global backbone network**.
-   Continually monitors the health of app endpoints and will detect an unhealthy endpoint and redirect traffic to healthy endpoints in less than 1 minute (**instant regional failover**).
-   It does not cache anything, just routes to the AWS network as optimal as possible.
-   Used for non-HTTP, or use cases that require static IP addresses or deterministic and/or fast regional failover.

{{< figure src="./img/aws_global_accelerator.png" >}}


#### Custom Routing Accelerator {#custom-routing-accelerator}

Route user traffic to specific EC2 instance in a single or multiple regions.

-   Supports only VPC subnet endpoints, cannot use ELB.


### Cloudfront {#cloudfront}

CDN (content delivery network) service for content delivery with the best possible performance and the lowest latency.

-   **IMPORTANT:** Cannot configure rules to direct methods to different origins. Only can configure the "AllowedMethods" parameter which controls which methods are available.
-   **IMPORTANT:** If Static Website Hosting is enabled in S3, then CF treats the origin as a custom origin.
-   **IMPORTANT:** To use ACM with CF, the certificate must be in us-east-1.
-   **IMPORTANT:** To solve occasional errors, set up an origin failover for specific HTTP failure codes.

-   Uploads direct to origins (no write caching) only used for downloads (**read only caching**).
-   Delivers content through edge locations.
-   **HTTP and WebSocket** protocols are only supported.
-   Use Lambda@Edge to customize the content or serve private content using signed URLs or signed cookies.


#### Components {#components}

-   Origin: source location of the content (S3 or custom HTTP server).
    -   Origins can be groups in origin groups for resilience and origin failover.
-   Distribution: configuration unit in CloudFront
-   Edge Location: local cache of your data (small compute instance closest to the user location).
-   Regional Edge Cache: larger version of edge locations which provides another layer of caching (bigger cache for multiple edge locations).

{{< figure src="./img/cloudfront.png" >}}

-   Behaviors: routing mechanism of the different contents to specific origins.

    -   Use pattern match to match to the origin.
    -   Are part of a distribution.

    {{< figure src="./img/cloudfront_behaviors.png" >}}


#### TTL &amp; Invalidation {#ttl-and-invalidation}

-   An object in an edge location is healthy if it is withing the TTL.
-   Default TTL (per behavior) is 24 hours (validity period).
    -   Minimum TTL and Maximum TTL can be set and also per object TTL

-   Origin Headers: used to control the cache.
    -   Can be added in custom origins (directly on the headers) or S3 (via object metadata).
    -   Cache-Control max-age (in seconds)
    -   Cache-Control s-maxage (seconds)
    -   Expires (Date &amp; Time)

-   Cache Invalidation is performed on a distribution and applies to all edge locations (takes time).
    -   There is a cost to perform invalidation.
    -   Only used to correct errors, if need to invalidate all the time, use versioned file names instead (give version names to files).
        -   Not the same as S3 versioning, CloudFront will always use the latest S3 file version.
        -   Logging is more effective
        -   Keep all versions of all files
        -   Caching in browser is also fixed


#### SSL {#ssl}

-   **IMPORTANT:** If the SSL certificate of the origin is expired, invalid or self signed, CF will return a 502 (Bad Gateway) and set the X-Cache header to "Error from Cloudfront".
-   **IMPORTANT:** To secure it to the internet, only a SSL cert on the viewer side is necesary done by:
    -   Using the default SSL/TLS cert by chaning the Viewer Protocol Policy setting from one or more cache behaviours to require HTTPS.
    -   Set the Viewer Protocol Policy to use Redirect HTTP to HTTPS or HTTPS Only.

-   SSL supported by default in the default domain name, apex domain name (CNAME).
-   Alternate domain names (CNAMES) need to generate or import a SSL cert in the AWS Cert Manager.

-   Two SSL Connections: Viewer -&gt; CloudFront and CloudFront -&gt; Origin
    -   **IMPORTANT:** Both need valid public certificates (and intermediate certs). Self signed certs don't work.

-   SNI (Server Name Indication) is a TLS extensions which allows a host to be included, being able to use the same IP for different certificates
    -   Old browsers don't support SNI, CF charges extra for dedicated IP.
    -   **IMPORTANT:** Use if you want to have multiple server names without having to reprovision the certificate.

{{< figure src="./img/cloudfront_ssl.png" >}}


#### Caching Performance &amp; Optimization {#caching-performance-and-optimization}

-   A request can have object names, query string parameters, cookies, and request headers
    -   You can customize each parameter if they should be forwarded to CF and if CF should cached them based on all or selected.
    -   Cache only on what can change the objects.
    -   The more things involved in caching, the less efficient the process is.


#### Security {#security}

-   **IMPORTANT:** Cannot assign IAM roles to a CF distribution.

<!--list-separator-->

-  Origin Side

    -   Origin Access Identity (OAI): only applicable for S3 (not Static Site Hosting)

        -   **IMPORTANT:** Can be associated with CloudFront Distributions which CF becomes the OAI to only allow CF access to the S3 bucket.
        -   The OAI can be used int S3 Bucket Policies

        {{< figure src="./img/cloudfront_security_oai.png" >}}

    -   Custom Origins: custom headers can be used sent by CloudFront to only allow CF to send requests to the custom origins. Custom header are usually used for the following:

        1.  Determining which requests come from a particular distribution: If you configure more than one CloudFront distribution to use the same origin, you can add different custom headers in each distribution. You can then use the logs from your origin to determine which requests came from which CloudFront distribution.
        2.  Enabling cross-origin resource sharing (CORS)
        3.  Controlling access to content

        4.  Also can use a firewall in the custom origin and only allow CF IP ranges in.
        5.  **IMPORTANT:** Usually WAF is used after the CF to check for the custom header and only allow CF access what is after WAF (usually an ELB).

        {{< figure src="./img/cloudfront_security_custom_origins.png" >}}

<!--list-separator-->

-  User Side

    -   Behaviors can be run in public or in private mode (requires signed cookie or URL).
    -   Signers are used to create the signed cookies or URLs.
        -   Create trusted key group(s) and assign them to behaviors, can have multiple keys and no need to use the root user account.

    -   Signed URLs provide access to one object only, or if the client does not support using cookies.
        -   includes additional information, for example, expiration date and time, that gives you more control over access to your content.

    -   Cookies provides access to group of objects, or maintaining applications URLs.
        -   you want to provide access to multiple restricted files, for example, all of the files in the members' area of a website.

    {{< figure src="./img/cloudfront_security_user_side.png" >}}

<!--list-separator-->

-  Geo Restriction

    -   CloudFront Geo Restriction is a whitelist or blacklist **country only**. Uses a GeoIP DB. And the config applies to the entire distribution.

        {{< figure src="./img/cloudfront_security_geo_restriction.png" >}}

    -   3rd Party Geolocation is completely customisable and more accurate. Restrictions can be for anything (licenses, purchase, etc.)

        -   Works with an App server that allows or denies access to CF

        {{< figure src="./img/cloudfront_security_3rd_party_geolocation.png" >}}

<!--list-separator-->

-  Field-Level Encryption

    -   Encryption of fields on the edge using a public key separately from the HTTPS tunnel.
    -   Use to encrypt sensitive data on the edge so no plain text is on the server.
    -   Private key is needed to decrypt the data so you can allow certain parts of the app the key

    {{< figure src="./img/cloudfront_security_field_level_encryption.png" >}}


### API Gateway {#api-gateway}

Create, publish, maintain, monitor, and secure APIs at any scale. HIPAA eligible service.

-   **IMPORTANT:** Edge-optimized API endpoints are the best for geographically distributed clients and mobile clients.
    -   Regional endpoints are best suited to traffic coming from within the region only.
-   **IMPORTANT:** API caching is used to cache endpoint's responses to reduce the number of calls made to the endpoint and also improve latency.

-   **IMPORTANT:** Can send the stream to an Amazon Kinesis Data Stream on which you can group requests in batches
    -   To for example decrease the requests to Lambda.

-   HA, and scalable, handles authorization, throttling, caching, CORS, transformations, OpenAPI spec, direct integration with AWS services, etc.
-   Authentication: can be used with Cognito user pools or Lambda based authorization.

{{< figure src="./img/apigateway.png" >}}

{{< figure src="./img/apigateway_architecture.png" >}}


#### Endpoint Types {#endpoint-types}

-   Edge-optimized: routed to the nearest CloudFront POP. Default for API Gateway REST APIs.
-   Regional: requests targeted to a specific region, less connection overhead.
    -   **IMPORTANT:** Can have multiple regional APIs to the same custom domain and use latency-based routing in R53.
-   Private: only accessible in a VPC via interface endpoints.


#### Stages {#stages}

-   Changes made in API Gateway are not LIVE, they need to be in a staged to be used.
-   Each stage has its own configuration and are not immutable, can be overwritten and rolled back.
-   Stages have versions for breaking changes.
-   You can deploy different stages of an api such as (prod or dev).
-   Each stage has its own deployment url and settings.
-   Stages can be enabled for canary deployments, so that certain percentage of traffic is sent to the canary.
-   You can use stage variables to point to lambda aliases.

{{< figure src="./img/apigateway_stages.png" >}}


#### Integrations {#integrations}

In the integration request, it can be just pass through the info (proxying) or translate it for a service.

-   MOCK: used for testing, no backend involvement.
-   HTTP: backend HTTP endpoint (need to configure method and integration requests (need translation)).
-   HTTP Proxy: pass through to integration unmodified, return to the client unmodified (backend need to be used supported format).
-   AWS: lets and api expose AWS service actions (need to configure both requests to set the necessary mappings from the request to the service) (also for response).
-   AWS_PROXY (LAMBDA): low admin overhead lambda endpoint.

{{< figure src="./img/apigateway_integrations.png" >}}


#### Types {#types}

<!--list-separator-->

-  HTTP

    -   Only support regional endpoints
    -   Only support mutual TLS (both parties authenticate with certs).
    -   For authorization supports IAM, Cognito, custom auth with lambda, JWT.
    -   Supports custom domains for the endpoints.
    -   Supports CORS, user-controlled deployments, automatic deployments, and request parameter transformation.
    -   Supports CW metrics, and CW logs for access logs.
    -   Integrates with public HTTP endpoints, AWS services, Lambda functions, NLB, ALB, AWS Cloud Map.

<!--list-separator-->

-  REST

    -   More expensive that HTTP APIs.
    -   Support edge-optimized, regional, and private endpoints.
    -   Support mutual TLS, certs for backend auth, AWS WAF.
    -   For authorization supports IAM, resource policies, Cognito, custom auth with lambda.
    -   Support custom domains, api keys (custom usage plans for users), per client rate limiting, per client usage limiting.
    -   Supports CORS, test invocations, caching, user-controlled deployments, custom gateway responses, canary release deploys, request validation, request (parameter/body) transformation.
    -   Supports CW, CW logs, A kinesis data firehose for access logs, execution logs, AWS X-Ray.
    -   Integrates with public HTTP endpoints, AWS services, Lambda functions, NLB, and mock integration.

<!--list-separator-->

-  Websockets APIS

    -   Supports two way communications
    -   Stateful frontend for an AWS service (such as Lambda or DynamoDB) or for an HTTP endpoint.
        -   The WebSocket API invokes your backend based on the content of the messages it receives from client apps.
    -   **IMPORTANT:** @connection command can be used with WebSockets.


#### Throttling Limits {#throttling-limits}

-   AWS throttling limits: across all accounts and clients in a region. Prevent API and account from being overwhelmed by too many requests (cannot be changed by the customer).
-   Per-account limits for a specific region: can be increased upon request.
-   Per-Api, per-stage (per api method).
-   Per-client throttling limits applied to clients that use api keys, to differentiate different users.


#### Extra {#extra}

-   Errors:
    -   400: bad request - generic, hard to diagnose
    -   403: access denied - authorizer denies
    -   **429**: api gateway can throttle, exceeded amount
    -   502: bad gateway exception, bad output returned by Lambda
    -   503: service unavailable: major service issue, backing endpoint offline
    -   **504**: integration failure timeout, 29s limit

-   Caching:
    -   Cached TTL defaults to 300s (min 0s, max 3600s)
    -   Configure per stage
    -   Can be encrypted
    -   Size (from 500MB to 237GB)

-   API Gateway can import and export to swagger/OpenAPI format (api description format for REST APIs).
-   To troubleshoot an API Gateway REST API or WebSocket API that you're developing, enable execution logging and access logging.
    -   Not useful when having "504 Gateway Timeout" errors.


### ELB (Elastic Load Balancing) {#elb--elastic-load-balancing}

Distributes incoming application or network traffic across multiple targets in multiple AZs.

-   Regional service that is HA and auto scalable.
-   Each ELB is configured with a DNS A record that resolves to all of the ELB nodes, and requests are distributed equally across nodes.
    -   If the node is saturated it scales, if it fails it is replaces, etc.
-   Recommended: 8+ free IPs per subnet and a /27 or larger subnet to allow for scale for the ELB.

-   Internet-facing: routes from the internet to the target
    -   Nodes of the ELB are given public and private addresses
    -   The endpoints do not have to be public, can use private EC2 instances.
-   Internal-facing: router between targets with private ip
    -   Nodes of the ELB are given only private addresses
    -   Use to separate tier layers

{{< figure src="./img/amazon_elastic_load_balances.png" >}}

<!--list-separator-->

-  Types

    <!--list-separator-->

    -  ALB (Application Load Balancer)

        Balances layer 7 (HTTP/HTTPS traffic/WebSocket) (no other protocol)

        -   **IMPORTANT:** Does not support assigning static IP addresses. If you need to do it there are 2 options:
            -   Use a Network Load Balancer before and assigned the static ip address to the NLB. It is the most cost effective.
            -   Use Global Accelerator when creating the ALB (not the most cost effective)
        -   **IMPORTANT:** Host conditions used to define rules that route requests based on the hostname in the host header (also known as host-based routing).
            -   This enables you to support multiple subdomains and different top-level domains using a single load balancer.

        -   At least 2 subnets must be specified when creating this type of load balancer.
        -   Health checks evaluate application health (layer 7)
        -   Actions: forward, redirect, fixed-response, authenticate-oidc &amp; authenticate-cognito
        -   HTTP or HTTPS is always terminated on the ALB, no end-to-end unbroken SSL. And a new connection is made to the application.
            -   TLS offloading can be used but a SSL cert needs to be added to the ALB (HTTPS connection from the client is terminated at the ALB).

        -   To distribute load you can use:
            -   Round Robing (weighted or not): better to distribute the load equally among healthy instances. Used when requests or targets are similar in complexity or need to distribute traffic equally
            -   Least outstanding requests: request vary in complexity or the targets have different processing capability
            -   Weighted random: route requests randomly and evenly

        <!--list-separator-->

        -  Benefits

            -   Support for path-based and host-based routing.
            -   Support for routing requests to multiple applications on a single EC2 instance.
            -   Support for registering targets by IP address, including targets outside the VPC for the load balancer.
            -   Support for containerized applications.
            -   Support for monitoring the health of each service independently.
            -   Support for redirecting requests from one URL to another.
            -   Support for returning a custom HTTP response.
            -   Support for the load balancer to authenticate users of your applications before routing requests using OIDC-compliant identity providers and/or Amazon Cognito user pools.
            -   Support for registering Lambda functions as targets.
            -   Supports load balancer-generated cookies for sticky sessions.
            -   Supports Application-based cookie stickiness. This ensures that clients connect to the same load balancer target for the duration of their session using application cookies.
            -   Supports dual-stack mode. This enables you to create IPv6 target groups and link IPv4 and IPv6 clients to targets in IPv6 or dual-stack subnets.

    <!--list-separator-->

    -  NLB (Network Load Balancer)

        Balances layer 4 (TCP/UDP with or w/o TLS)

        -   **IMPORTANT:** Don't have SGs configured and pass connections straight to the target with the source IP of the client preserved.
        -   **IMPORTANT:** Must ensure that the SGs for the targets allow traffic on both the listener port and the health check port from the outside.

        -   **IMPORTANT:** TLS termination can be used to handle encryption and decryption to provide low latency and high throughput traffic
        -   **IMPORTANT:** Cannot bind an ECS to NLB as the ECS has dynamic port mapping with binds instances dynamically.

        -   DNS failover, uses Route 53 to direct traffic to other zones (cross-zone LB disabled by default).
        -   They distribute the load with **flow hash** based on the protocol, source IP address, source port, destination IP address, destination port, and TCP sequence number.
        -   Used for: unbroken encryption, static IPs (useful for whitelisting), fastest performance, protocols not HTTP/S, or PrivateLink.
        -   Health check just check ICMP/TCP Handshake (no app aware)
        -   Supports TLS termination on Network Load Balancers. Preserve the source IP of the clients to the back-end applications, while terminating TLS on the load balancer.

        <!--list-separator-->

        -  Benefits

            -   Ability to handle volatile workloads and scale to millions of requests per second.
            -   Support for static IP addresses for the load balancer, or assign one Elastic IP address per subnet enabled for the load balancer.
            -   Support for registering targets by IP address.
            -   Support for routing requests to multiple applications on a single EC2 instance (register each instance or IP address with the same target group using multiple ports).
            -   Support for containerized applications.
            -   Support for monitoring the health of each service independently.
            -   Supports forwarding traffic directly from NLB to ALB.
            -   Supports load balancing for both IPv4 and IPv6 clients.

    <!--list-separator-->

    -  GWLB (Gateway Load Balancer)

        Primarily used for deploying, scaling, and running third-party virtual appliances such as firewalls, intrusion detection and prevention systems, and deep packet inspection systems.

        -   **IMPORTANT:** Cannot specify publicly routable IP addresses as your target

        -   Balances layer 3 (IP) and runs within 1 AZ.
        -   GWLB endpoints are where the traffic enters/leaves (they are a VPC endpoint)
        -   Traffic and metadata is tunneled using GENEVE protocol
        -   Manages flow stickiness, flow of data to the same appliance. It maintains stickiness of flows to a specific target appliance using 5-tuple (for TCP/UDP flows) or 3-tuple (for non-TCP/UDP flows).
        -   Does not support SSL Offloading, Server Name Indication (SNI), Back-end Server Encryption, User Authentication, Custom Security Policy or Application-Layer Protocol Negotiation (ALPN)

        {{< figure src="./img/ec2_load_balancer_gateway.png" >}}

        {{< figure src="./img/ec2_load_balancer_gateway_architecture.png" >}}

    <!--list-separator-->

    -  CLB (Classic Load Balancer)

        Internet-facing load balancer has a publicly resolvable DNS name, so it can route requests from clients over the Internet to the EC2 instances.

        -   First type of load balancers and they should be avoided
        -   Ensure to keep approximately the same number of instances in each AZ registered with the load balancer.
        -   Every unique HTTPS name requires an individual CLB because SNI (server name indication) isn't supported

<!--list-separator-->

-  Cross-Zone Load Balancer

    Distribute the connections across all instances of different AZs for equal load across instances.

    -   Solves the problem that if in one subnet there are 5 instances and the other 1, then the load is not equally distributed among the instances.
    -   Each LB node can distribute traffic to other zones
    -   Enabled by default for ALB, disabled in NLB.

    {{< figure src="./img/amazon_elastic_load_balances_cross_zone.png" >}}

<!--list-separator-->

-  Connection Stickiness

    Server-side piece of information which persists when you interact with that app.

    -   Can be stored on a server or externally (stateless)
    -   Generates a cookie (AWSALB) which locks the device to a single backend instance for a duration (1 to 7 days).
    -   All connections will go to the same instance.
    -   Backend changes if the cookie is expired or there is an instance failure
    -   Useful for stateful applications.
    -   Can cause an uneven load on the servers.

    {{< figure src="./img/amazon_elastic_load_balances_connection_stickiness.png" >}}

<!--list-separator-->

-  Connection Draining

    Allows the connections to be gracefully removed from a load balancer when the instance is going out of service

    -   **IMPORTANT:** Used when users get request timeout and partially loaded pages.

    -   Default to all connections are closed and no new connections to the instance
    -   Allows in-flight requests to complete (old connections)
    -   Supported on classic load balancers only, defined on it
    -   Timeout between 1 and 3600 seconds (default 300).
    -   If it is deregistered it goes to "InService" and waits for all connections to complete or timeout

<!--list-separator-->

-  Deregistration Delay

    Stops sending requests to deregistering targets, existing connections can continue until they complete naturally.

    -   Supported on ALB, NLB, and GWLB
    -   Defined on the target groups not the LB
    -   Enabled by default
    -   Can range from (0 to 3600 seconds) default 300

<!--list-separator-->

-  X-Forwarded &amp; Proxy Protocol

    Used when using a LB and you want to know the source IP

    <!--list-separator-->

    -  X-Forwarded

        HTTP header (only works on HTTP/S protocols no other)

        -   Header is added or appended by proxies/ELBs
        -   Backed web server needs to be aware of this header
        -   Supported by ALB and CLB
        -   Supported headers: X-Forwarded-For, X-Forwarded-Proto, and X-Forwarded-Port headers.

    <!--list-separator-->

    -  Proxy Protocol

        -   Works at Layer 4 (layer 4 tpc header)
        -   Works with CLB (v1) and NLB (v2 - binary encoded)
        -   End to end encryption, unbroken HTTPS (tcp listener)

<!--list-separator-->

-  Pricing

    -   Charged for each hour or partial hour that an Application Load Balancer is running and the number of Load Balancer Capacity Units (LCU) used per hour.
    -   Charged for each hour or partial hour that a Network Load Balancer is running and the number of Load Balancer Capacity Units (LCU) used by Network Load Balancer per hour.
    -   Charged for each hour or partial hour that a Gateway Load Balancer is running and the number of Gateway Load Balancer Capacity Units (GLCU) used by Gateway Load Balancer per hour.
    -   Charged per VPC endpoint, AZ, and GB of data processed for the Gateway Load Balancer Endpoint.
    -   Charged for each hour or partial hour that a Classic Load Balancer is running and for each GB of data transferred through your load balancer.


### Route 53 {#route-53}

Highly available, global and scalable Domain Name System (DNS) web service used for domain registration, DNS routing, and health checking.

-   **IMPORTANT:** design to withstand DNS query floods.
-   **IMPORTANT:** Use R53 Application Recovery Controller are switches to direct traffic from one replica to another.
    -   This switches can be autoamated with CW alarms or Lambda functions.
    -   Usually used to detect partial failures.

-   CNAMEs cannot be used for the naked/apex domain. ALIASES are used to map a Name to an AWS resource.
    -   Free of charge if ALIAS points to an AWS record.
    -   The type of the ALIAS should be the same type as what the record is pointing at, if the AWS resource provides an IP, then it should be a A record.

{{< figure src="./img/route_53_role.png" >}}


#### Hosted Zones Types {#hosted-zones-types}

<!--list-separator-->

-  Public

    -   DNS Database (zone file) hosted in 4 R53 Nameservers which use NS records to point to those NS.
    -   Accessible from the public internet and VPCs.
    -   Resource Records (RR) created withing the Hosted Zone

    {{< figure src="./img/route_53_public_hosted_zones.png" >}}

<!--list-separator-->

-  Private

    -   **IMPORTANT:** Health checks can only be against failover, multivalue answer, weighted, latency, and, geolocation records.
        -   Need public addressing, cannot be done on private IPs.
    -   **IMPORTANT:** Compatible routing policies: simple, failover, multivalue answer, weighted, latency-based, and geolocation.

    -   Only accessible to associated VPCs.
    -   The R53 Resolver is the VPC +2 address
    -   The DNS resolver must be activated for VPC be able to access DNS records with private IPs
        -   "enableDnsHostnames" and "enableDnsSupport" must be enabled.
    -   Split-view (overlapping private &amp; public hosted zones with the same zone name)

    {{< figure src="./img/route_53_private_hosted_zones.png" >}}


#### Health Checks {#health-checks}

Check specific resources, other health checks or the status of CW alarms by a global distributed network of computer.

-   **IMPORTANT:** HTTPS health checks don't validate SSL/TLS certificates, so checks don't fail if a certificate is invalid or expired.
    -   Endpoint must support TLS for HTTPS health checks.
-   **IMPORTANT:** If you specify the endpoint by domain name, Route 53 uses only IPv4 to send health checks to the endpoint.
-   **IMPORTANT:** Does not integrate with SNS directly. Need to monitor them via CloudWatch.
-   **IMPORTANT:** Records without a health check are always considered healthy. If no record is healthy, all records are considered healthy.

<!--listend-->

-   By default checks are done every 30s but can be done every 10s with extra cost.
-   Can be TCP (10s), HTTP, HTTPS (4s), HTTP, HTTPS with string matching (4s).
    -   **IMPORTANT:** With string matching, the string must be present in the first 5120 bytes to be healthy.
-   Performed by multiple servers and if **more than 18% are healthy, then the health check is healthy**.
-   If you specify a non-AWS endpoint, an additional charge applies. Charges for a health check apply even when the health check is disabled.
-   Need public addressing as they are coming from the public internet.
    -   **IMPORTANT:** If they are used inside a VPC, CW alarms must be used.

<!--list-separator-->

-  Failover Configurations

    -   Active-Active Failover: all the records that have the same name, the same type, and the same routing policy are active unless Route 53 considers them unhealthy.
        -   Use when all of the resources must be available the majority of the time.

    -   Active-Passive Failover: use when a primary resource to be available the majority of the time and a secondary resource to be on standby in case all the primary resources become unavailable.
        -   To create an active-passive failover configuration with one primary record and one secondary record, you just create the records and specify Failover for the routing policy.


#### Routing Policy Types {#routing-policy-types}

-   Simple Routing: route internet traffic to a single resource.

    -   Can specify multiple values in the same record, such as multiple IP addresses.

    {{< figure src="./img/route_53_simple_routing.png" >}}
-   Failover Routing: configure active-passive failover.
    ![](./img/route_53_failover_routing.png)
-   Multi Value Routing: respond to DNS queries with up to 8 healthy records selected at random.
    ![](./img/route_53_multi_value_routing.png)
-   Weighted Routing: route traffic to multiple resources in specific proportions.
    ![](./img/route_53_weighted_routing.png)
-   Latency Based Routing: route traffic to the resource that provides the best latency.
    ![](./img/route_53_latency_based_routing.png)
-   Geolocation Routing: route internet traffic to your resources based on the location of your users.
    ![](./img/route_53_geolocation_routing.png)
-   Geoproximity Routing: route traffic based on the location of your resources and, optionally, shift traffic from resources in one location to resources in another.

    -   **IMPORTANT:** Good to control the user traffic to specific regions. However, a multivalue answer routing policy may cause the users to be randomly sent to other healthy regions that may be far away from the user's location.
    -   Bias can be used to expand or shrink the size of the geographic region from which traffic is routed to a resource.

    {{< figure src="./img/route_53_geoproximity_routing.png" >}}
-   IP-based Routing: route traffic based on your users' locations, and know where the IP address or traffic is coming from.


#### Resolvers {#resolvers}

Answers DNS queries for VPC domain names and performs recursive lookups against public name servers for all other domain names.

-   **IMPORTANT:** When forwarding queries from the R53 Resolver to AD servers, use forwarding rules.
-   **IMPORTANT:** When forwarding queries from the AD servers to the R53 Resolver, use conditional forwarders.

-   Can forward DNS queries to Resolver in a specified VPC. Also forward queries in your VPCs to DNS resolvers on an on-premises network.
-   Regional service.

-   **Inbound endpoint** perform DNS queries in a a Route 53 Hosted Zone from inside a VPC.
-   **Outbound endpoint** forward DNS queries to an on-premise DNS server or EC2 appliance.

{{< figure src="./img/route_53_endpoints.png" >}}

-   Route 53 Resolver DNS Firewall: managed firewall to block DNS queries made from known malicious domains and allow queries from trusted domains.
    -   Achieved through the use of "blocklists" and "allowlists".


#### Supported DNS Record Types {#supported-dns-record-types}

-   **IMPORTANT:** For EC2 instances, always use a Type A Record without an Alias. For ELB, CF, and S3, a Type A Record with an Alias, and finally, for RDS, always use the CNAME Record with no Alias.
-   **IMPORTANT:** To route domains to AWS services such as ELB, use always Alias records.

-   A: the value for an A record is an IPv4 address in dotted decimal notation.
-   AAAA: the value for an AAAA record is an IPv6 address in colon-separated hexadecimal format.
-   CAA: lets you specify which certificate authorities (CAs) are allowed to issue certificates for a domain or subdomain.
-   CNAME: a CNAME Value element is the same format as a domain name.
-   DS: represents key tag, algorithm, digest type, and digest of the zone key.
-   MX: each value for an MX record actually contains two values, priority and domain name.
-   NAPTR: converts one value to another or replaces one value with another.
-   NS: identifies the name servers for the hosted zone. The value for an NS record is the domain name of a name server.
-   PTR: is the same format as a domain name.
-   SOA: provides information about a domain and the corresponding Amazon Route 53 hosted zone.
-   SPF: a list of all authorized hostnames or IP addresses that are allowed to send an email on behalf of your domain.
-   SRV: represents priority, weight, port, and domain name.
-   TXT: contains text information for sources outside your domain.


#### DNSSec {#dnssec}

Provides data origin authentication and data integrity verification for DNS.

{{< figure src="./img/route_53_dnssec.png" >}}


## Security &amp; Identity {#security-and-identity}


### IAM (Identity Access Manager) {#iam--identity-access-manager}

Centralized control of authentication and authorization within AWS for all services. PCI-DSS compliant.

-   **IMPORTANT**: There is a hard max service quota of 5k users per account. If you need more, use a third-party identity provider.


#### Entities {#entities}

-   They are global for a given account across regions
-   By default, there is an implicit deny policy for everything
-   Principal is a entity allowed or denied access to AWS, can be a user, role, federated user, or an application.

<!--list-separator-->

-  User

    Individual person or end user that interacts with AWS

    -   Access Keys: long-term credentials used for iam users

<!--list-separator-->

-  Groups

    Collection of IAM Users with shared permissions. It is good practice to attach policies to groups and not to users as users can move around the organization. All users will inherit the policies of the group.

    -   Cannot be referenced by ARNs in resource policies

<!--list-separator-->

-  Roles

    Identity that can be assumed for temporary access to AWS credentials.

    -   Used for delegation to users, apps, or services that do not normally have access to the AWS resources.
    -   A user that assumes a role temporarily, gives up his own permissions and instead takes the permissions of the role.

<!--list-separator-->

-  Policies

    Documented rule set that are apply to grant or limit access. Attached to iam users, groups and policies.

    <!--list-separator-->

    -  Types

        -   Identity-based: attached to an IAM user, group, or role and specifies what that identity can do (its permissions)
        -   Permission Boundaries: maximum permissions that the identity-based policies can grant to an entity (not for resource-based policies), but does not grant permissions (only limits).
        -   Resource-based: attached to a resource (S3, SQS, KMS, etc.) and specifies what that resource can do
            -   **IMPORTANT:** the user still works in the trusted account and does not have to give up his or her user permissions in place of the role permissions.
        -   Organizations SCPs: policies to limit AWS accounts of a AWS Organization
        -   Access Control Lists: legacy policy (depreciated) from of limit aws resource access (example S3)
        -   Session policies: policy associated to a STS when a role is assumed.

    <!--list-separator-->

    -  Policy Evaluation Logic

        -   An explicit deny will always override an explicit allow

        <!--list-separator-->

        -  Single Account

            {{< figure src="./img/policy_evaluation_logic.png" >}}

        <!--list-separator-->

        -  Multiple Accounts (A -&gt; B)

            If account A contains the identity policies and B the resource policy, then to be allowed, account B needs to be access from account A and account A needs to allow access to account B.

    <!--list-separator-->

    -  Important Notes

        -   Use "aws:PrincipalOrgID" with the Org ID in a condition element, to allow only the principals in an Organization to the required resource-based policy
        -   Use '"aws:ResourceTag/&lt;Tag name&gt;": "&lt;Tag value&gt;' in a "StringEquals" conditional statement to only allow specific tags


#### Best Practices {#best-practices}

-   Lock down the AWS root user
-   Follow the principle of least privilege
-   IAM can only be used to secure access to AWS account and resources.
-   Use IAM roles when possible, as they are temporary.
-   Using identity providers (can be AWS IAM Identity Center) to provide a single source of identity
-   Regularly review and remove unused users, roles, and other credentials.


#### STS (Security Token Services) {#sts--security-token-services}

Generates temporary credentials for principals to access AWS resources.

{{< figure src="./img/aws_sts.png" >}}

-   ExternalID: Optional parameter that can be used for additional security when a role is assumed (by sts:AssumeRule) by an entity outside of your AWS account and verification during role assumption.
    -   **IMPORTANT**: Provided by the third-party to ensure it is unique.
    -   Solves the confused deputy problem.

-   Revoking Temporary Credentials: create a policy with a conditional deny for the current time, so any identity has to renew their credentials
    ![](./img/revoking_temporary_credentials.png)

<!--list-separator-->

-  Assume Role Options

    -   AssumeRole: assume a role from an existing AWS principal. Usually for your account or for cross-account access.
        -   MFA can be included.

    -   AssumeRoleWithSAML: assume a role with a SAML identity. Usually for enterprise identity store.
    -   AssumeRoleWithWebIdentity: assume a role with a web identity.


#### IAM Access Analyzer {#iam-access-analyzer}

Identify unintended access to the resources in your organization and accounts (S3 or IAM roles) which are **shared with an external entity**.

-   **IMPORTANT:** If the organization is set up as a zone of trust, it will generate findings only for external accounts.
-   **IMPORTANT:** Use for validate policies, generate policies based on CloudTrail logs, and identify resources in the AWS account that are shared with an external entitiy.

-   External Access Analyzers: identify resources that are shared with an external entity.
-   Unused Access Analyzers: identify unused access.
-   Validate IAM policies against policy grammar and AWS best practices.
-   Custom Policy Checks: validate IAM policies against your specified security standards.
-   Generate IAM policies based on access activity in your AWS CloudTrail logs.


#### IAM Identity Center (Previously Single Sign-On) {#iam-identity-center--previously-single-sign-on}

Access multiple AWS account with the same credentials used to manage AWS resources via the Console, API, or CLI.

-   **IMPORTANT:** To connect external AD: configure AD Connector in the Directory Service as a directory gateway to forward directory requests. Connect Identity Center to the AD by using the AD Connector.
-   **IMPORTANT:** Uses permissions sets which are provisioned to AWS accounts as IAM roles.

-   Flexible Identity Source
    -   Built-in identity store
    -   AWS Managed or On Premise Microsoft Active Directory
    -   External SAML2.0
-   If an external identity source is used, an Active Directory Connector or Trust must be used

{{< figure src="./img/aws_identitiy_center.png" >}}


### Organizations {#organizations}

Account management service that enables you consolidate multiple AWS account into an organization to centrally govern the environment as it grows and scales.

-   **IMPORTANT:** When adding existing account to an org, you need to add a policy "OrganizationAccountAccessRole" to allow the root IAM admin access the other account as admin (must be an IAM user cannot do with root).

-   Management account: account used to create your organization. Cannot change it.
-   Organizational Unit (OU): group of similar accounts for administration as a single unit.
    -   Policy-based controls can be attached to an OU, and all subsequent account withing the OU inherit the policy.

{{< figure src="./img/aws_organizations.png" >}}


#### SCP (Service Control Policies) {#scp--service-control-policies}

Is a policy document to restrict access that can be attached to a member account, OU.

-   **IMPORTANT:** SCPs only affect member accounts. No effect on users or roles in the management account.
-   **IMPORTANT:** SCPs do not affect any service-linked role (roles that AWS managed services use) or resource-based policies.

-   Affect the organization tree (affect the whole sub tree below), even the root users of the accounts.
-   They don't grant permissions only restrict them and they take preference above all.

{{< figure src="./img/aws_scp.png" >}}

<!--list-separator-->

-  Types

    -   Deny list (default): block by default and state what is allowed -&gt; (delete the "FullAWSAccess policy")
    -   Allow list: allow by default and state what is denied -&gt; (keep the "FullAWSAccess policy")


#### Best Practices {#best-practices}

-   **IMPORTANT:** Set up a separate security account for logging, tooling, and audit-related activies.

-   Root account to manage billing only with separate accounts used to deploy resources.
-   Use "Consolidated Billing" where the billing is payed by the management account also referred as "payer account".
-   Have a single account for login and delegate via sts:AssumeRole to other accounts.
-   Use SCPs to establish access controls so that all IAM principals (accounts, users or roles) adhere to them.
-   [more](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_best-practices.html)


#### Configurations {#configurations}

-   Macie Auto-enable settings: enable it for all accounts.

-   Feature Sets:
    -   Consolidated billing: see combine view of charges incurred by all accounts and charges to the master account.
    -   All features: consolidated billing features plus a set of advanced features such as SCP.


### RAM (Resource Access Manager) {#ram--resource-access-manager}

Share AWS resources (not all are supported) between AWS accounts, AWS Organizations or AWS Organizational Units

-   **IMPORTANT**: VPCs cannot be shared with RAM, but you can share prefix list to imitate the share. Note you can share subnets also.

-   No charges for using RAM (only service cost)

-   Owner account: account who owns the services shared
    -   Retains full ownership: shared accounts don't have access to modify only to read and use.
    -   Defines the principals with whom to share: if the participant is inside an ORG with sharing enabled, it is accepted automatically; if not an invite has to be accepted
    -   Each account has flexibility to name the resources independently

{{< figure src="./img/ram_vpc_share_infrastructure.png" >}}


### Cognito {#cognito}

User management and authentication service that can be integrated to your web or mobile applications.

-   **IMPORTANT:** When a custom domain is added to the user pool, a CloudFront distribution is created with a certificate.
    -   This CF distribution is owned by Cognito and not the individual account. To remove this certificate associated with CF distribution you can:
        -   Delete the custom domain name for Cognito.
        -   Remove the association of the ACM certificate with the CF distribution.

-   Ability to authenticate users through an external identity provider and provides temporary security credentials.
-   Works with external identity providers that support SAML or OpenID Connect, social identity providers and custom identity providers.
-   Cognito ID token is represented as a JSON Web Token (JWT).


#### User Pools {#user-pools}

User directories that provide sign-up and sign-in options for your app users.

-   Provides user directory management and user profiles, sign-up and sing-in with customizable web UI, MFA and other security features
-   Can create groups to differentiate types of users.
-   Created in one AWS Region, and they store the user profile data only in that region.
    -   You can also send user data to a different AWS Region.

{{< figure src="./img/aws_cognito_user_pools.png" >}}


#### Identity Pools {#identity-pools}

Federate users to AWS services using temporary credentials.

-   **IMPORTANT:** Unauthenticated access allowed where users request an identity ID via the GetId API
-   **IMPORTANT:** Once authenticated with an OpenID token, temporary AWS credentials can be acquired via the AssumeRoleWithWebIdentity API.

-   Permissions for each authenticated and non-authenticated user are controlled through IAM roles
-   Save user profile information, the identity pool needs to be integrated with a user pool.
-   Support:
    -   anonymous guest users
    -   Amazon Cognito user pools
    -   Social sign-in with Facebook, Google, and Login with Amazon
    -   OpenID Connect (OIDC) providers
    -   SAML identity providers
    -   Developer authenticated identities

{{< figure src="./img/aws_cognito_identity_pools.png" >}}


#### Authentication Flow {#authentication-flow}

-   Enhanced authflow: performs GetOpenIdToken and AssumeRoleWithWebIdentity in the background
    1.  Presents an ID token from an authorized Amazon Cognito user pool or third-party identity provider in a GetID request.
    2.  The app exchanges the token for an identity ID in your identity pool.
    3.  The identity ID is then used with the same identity provider token in a GetCredentialsForIdentity request.
    4.  Returns AWS API credentials valid for 1 hour.

-   Basic (classic) authflow: more granular control over the credentials as you can request a custom role and a custom session duration.
    1.  Presents an ID token from an authorized Amazon Cognito user pool or third-party identity provider in a GetID request.
    2.  The app exchanges the token for an identity ID in your identity pool.
    3.  The identity ID is then used with the same identity provider token in a GetOpenIdToken request.
    4.  GetOpenIdToken returns a new OAuth 2.0 token that is issued by your identity pool.
    5.  You can then use the new token in an AssumeRoleWithWebIdentity request to retrieve AWS API credentials.


### KMS (Key Management System) {#kms--key-management-system}

Create, store and manage keys (symmetric and asymmetric), and also perform cryptographic operations (encrypt, decrypt, etc.)

-   **IMPORTANT:** Does not allow control over the CMK (customer managed key). For this use CloudHSM.
-   **IMPORTANT:** If access is lost to the key, contact AWS Support.
-   **IMPORTANT:** KMS key deletion is irreversible. Deletion schedule can be enabled from 7 to 30 days.
    -   Can cancel deletion during this period.

-   Regional &amp; Public Service
-   KMS Keys can be used to encrypt up to 4KB of data, and isolated to a region.
    -   But can be replicated to other regions (multi-region)
-   Keys can be AWS owned, AWS managed, or Customer managed.
-   KMS Keys support rotation, it stores the backing key and the previous keys


#### ABAC (Attribute-Based Access Control) {#abac--attribute-based-access-control}

Authorization strategy that defines permissions based on attributes.

-   KMS allows to control access to CMKs based on the tags and aliases associated with the KMS keys.
-   Use with care so principals aren't inadvertently allowed or denied access.
    ```nil
      {
        "Version": "2012-10-17",
        "Statement": [
          {
            "Sid": "AliasBasedIAMPolicy",
            "Effect": "Allow",
            "Action": [
              "kms:Decrypt",
              "kms:Encrypt",
              "kms:GenerateDataKey*",
              "kms:DescribeKey"
            ],
            "Resource": "arn:aws:kms:*:111122223333:key/*",
            "Condition": {
              "StringEquals": {
                "aws:ResourceTag/Purpose": "Test"
              }
            }
          }
        ]
      }
    ```


#### Extra {#extra}

-   Aliases can be created to specify a KMS Key (but they are specify per region by default)

-   AWS managed CMKs support 3 years key rotation and cannot be created, changed, or disabled
-   Customer managed CMKs support key rotation with a duration of 1 year

-   Data Encryption Keys (DEKs) are generated from a KMS Key with the GenerateDataKey operation.
    -   KMS returns you with the plaintext and ciphertext DEK

-   Key Policy (resource policy type) which every key has one, can only be modified by the Principal owner of the key.
-   Deny by default, need to explicitly allow a specific account to be trusted.


### Detective {#detective}

Automatically collect log data and uses ML, statistical analysis, and graph theory to build a linked set of data to easily conduct faster and more efficient security investigations.

-   **IMPORTANT:** Simplifies the process of investigating security findings and identifying the root cause.
-   **IMPORTANT:** It is a regional service (enabled per region). Can be configured as multi-account monitoring deployment with and administrative and member accounts.

-   Can be configured with GuardDuty, Macie, Security Hub.
-   Detective automatically extracts time-based events such as login attempts, API calls, and network traffic from AWS CloudTrail and Amazon VPC flow logs. It also ingests findings detected by GuardDuty.


### GuardDuty {#guardduty}

Intelligent threat detection service that analyzes logs from CloudTrail, VPC Flow Logs, and DNS Logs.

-   **IMPORTANT:** It is a regional service (enabled per region). Can be configured as multi-account monitoring deployment with and administrative and member accounts.
-   **IMPORTANT:** Used for broad protection of AWS accounts, workloads, and data by helping to identify threats such as attacker reconnaissance, instance compromise, and account compromise.

-   Learns patters of what appends normally and alerts you whenever there is something not normal (known as findings)
-   When there is a finding you can notify or event-driven protection/remediation though EventBridge.
-   Threat detection categories:
    -   Reconnaissance: unusual API activity, port scanning, unusual failed login events, unblocked port probing from bad IPs.
    -   Instance compromise: cryptocurrency mining, backdoor command and control activity, malware using domain generation algorithms, outbound DoS activity, unusually network traffic
    -   Account compromise: API calls from an unusual geolocation or anonymizing proxy, attempts to disable AWS CloudTrail logging, changes that weaken the account password policy.


### Inspector {#inspector}

Automated security assessment service used to scan EC2 instances such as OS, containers, vulnerabilities (CVE), and deviations against best practices.

-   **IMPORTANT:** Uses IAM service-linked roles
-   **IMPORTANT:** Assessments can be network (agentless) or network &amp; host assessment (agent needed) related.
    -   Inspector Classic agent collects installed package information and software configuration for an EC2 instance.

-   Run periodically on an specified interval of 15min, 1h, 8/12h or 1 day.
-   Rules packages determine what is checked and have different severity levels (high, medium, low, and informational)
    -   Network Reachability Rule Package (no agent required) checks for any networking connections, and also ports.
    -   CVE Rule Package: checks for common vulnerabilities
    -   CIS Benchmarks Rule Package: checks against internet security
    -   Security best practice Rule Package: best amazon best practices


### Macie {#macie}

Security service that uses machine learning to automatically discover, classify, and protect sensitive data in **S3 and CloudTrail event logs**.

-   **IMPORTANT:** Not used to identify security credentials or IAM access keys uploaded in a repo with commits, better use a custom Lambda function.
-   **IMPORTANT:** Uses service-linked roles
-   **IMPORTANT:** Can be configured as multi-account monitoring deployment with and administrative and member accounts.

-   Does not support all file formats such as .wav.
-   Automated data identifiers (personal identifiable information, financial, personal health information, keys, etc.)
-   Can scan S3 buckets across multiple accounts, and perform scoping of scans by object prefix.
-   Can be used on encrypted objects. For SSE-KMS or SSE-CMK, Macie needs access to the encryption key.

-   Data Identifiers:
    -   Managed (maintained by AWS): built ins with ML/patterns. Detect almost all common data types of sensitive data
    -   Custom (proprietary): regex based, keywords with maximum matching distance and ignore words

-   Discovery jobs -&gt; findings -&gt; view or integrate with other AWS services Security Hub or EventBridge

-   Types of findings:
    -   Policy findings: when policies or settings in a bucket are changed which reduces the security of the objects or bucket, after Macie is enabled.
    -   Sensitive data: when it detects sensitive data

{{< figure src="./img/amazon_s3_amazon_macie.png" >}}


### ACM (Certificate Manager) {#acm--certificate-manager}

Manage certificates public or private (private CA needs to be trusted)

-   **IMPORTANT:** Regional service where certs cannot leave the region they are generated or imported
-   **IMPORTANT:** To use certs with a ALB, they must be in the same region. For CloudFront must be in us-east-1.

-   Manages the renewal process of generated certificates. If they are imported, you need to handle the renewal process.
-   Each ACM Certificate must include at least one fully qualified domain name (FQDN)

{{< figure src="./img/acm.png" >}}


### CloudHSM {#cloudhsm}

Computing device that enables to provision and manage a own single-tenant HSMs for the generation and use of encryption keys.

-   **IMPORTANT:** Used for encryption at rest that uses keys that are BOTH provided by AND controlled by the company.

-   KMS can use CloudHSM as a custom key store
-   CloudHSM is created in a AWS managed VPC an any node replicates keys to keep them in sync
-   ENIs are created in your VPC for every node in HSM

-   Used for:
    -   Offload the SSL/TLS processing for web servers (KMS cannot)
    -   Transparent Data Encryption (TDE) for Oracle Databases
    -   Protect the private keys for an issuing certificate authority (CA)

{{< figure src="./img/cloudhsm.png" >}}


### Directory Service {#directory-service}


#### Managed Microsoft AD {#managed-microsoft-ad}

Service to enable directory-aware workloads and AWS resources to use managed Active Directory in the AWS Cloud.

-   **IMPORTANT:** Use Active Directory Migration Toolkit to migrate users from on-premises to the cloud.
-   **IMPORTANT:** Can be used as a standalone directory service, or be connected with an existing Microsoft AD.
    -   To use an existing AD, it is require to configure a 2 way AD trust relationship between AWS and on-premises.
-   **IMPORTANT:** Supports RADIUS-based MFA

-   Supports group policy, SSO, and schema extension (MS AD Aware Apps)
-   Can be used with Sharepoint, SQL, and distributed file system (DFS)
-   Highly available by default (2AZ+)
-   Best choice for more than 5k users and if you need trust relationships between AWS and on-premise resources.

-   Sizes: standard (30k objects) &amp; enterprise (500k objects)

{{< figure src="./img/microsoft_active_directory.png" >}}


#### AD Connector {#ad-connector}

Proxy service to connect compatible AWS applications (WorkSpaces, QuickSight, or EC2 for Windows Server instances) to an existing on-premises Microsoft Active Directory.

-   **IMPORTANT:** Best choice to use an existing on-premises directory with compatible AWS services.
-   **IMPORTANT:** Needs a working network connection, via Direct Connect or VPN

-   They deploy a pair of directory endpoints running in AWS (ENIs in a VPC)
-   Requires 2 subnets withing a VPS in different AZs
-   Sizes: small and large (difference in amount of compute allocated)
-   Multiple AD connectors can be used to spread load
-   Usually used for proof of concepts as it relies on the network connection
-   Use RADIUS server to enable MFA

{{< figure src="./img/active_directory_connector.png" >}}


#### Simple AD {#simple-ad}

Standalone Microsoft Active Directory–compatible directory from AWS Directory Service powered by Samba 4.

-   Used as a standalone directory in the cloud to support Windows workloads that need basic AD features, compatible AWS applications, or to support Linux workloads that need LDAP service.
-   Sizes: standard (500 users) &amp; enterprise (5k users)


#### Cloud Directory {#cloud-directory}

Cloud-native directory that can store hundreds of millions of application-specific objects with multiple relationships and schemas.

-   Used for a highly scalable directory store for your application's hierarchical data.
-   Supports uploading of a compliant JSON file for schema creation.


### Firewall Manager {#firewall-manager}

Administration and maintenance tasks across multiple accounts and resources. Set up your firewall rules just once, and automatically apply across accounts and resources.

-   **IMPORTANT:** Must be associated with the management account of the organization or associated with a member account that has the appropriate permissions.
    -   The account that you associate with Firewall Manager is called the Firewall Manager administrator account.

-   Apply WAF rules, as well as Managed Rules for AWS WAF, on a group of resources.
-   Integrated with AWS Organizations.
-   Apply protection policies in a hierarchical manner, to delegate the creation of application-specific rules while retaining the ability to enforce certain rules centrally.


#### Network Firewall {#network-firewall}

Managed service to deploy network protections for VPCs.

-   **IMPORTANT:** Rules are processed starting from the lowest number priority setting.

-   Fine-grained network traffic control to restrict outbound requests to prevent malicious activity from spreading.
-   Import previously created rules in common open source rule formats and enable integrations with managed intelligence feeds from AWS partners.
-   Create policies based on AWS Network Firewall rules and then apply those policies centrally across your VPCs and accounts.


### Parameter Store {#parameter-store}

Storage for configuration &amp; parameters

-   Store plaintext and ciphertext (integration with KMS but need to have access)
-   Store strings, string lists, and secure strings (license codes, database strings, full configs &amp; passwords)
-   Supports hierarchies &amp; versioning
-   Can also store secrets but Secrets Manager is recommended.


### Secrets Manager {#secrets-manager}

Store, management, and rotation of secrets (passwords, api keys, etc).

-   Automatic rotation (uses lambda) and directly integrates with some AWS products (RDS)
-   Encrypted at rest using KMS
-   Can have multiple versions of a single secret.

{{< figure src="./img/secrets_manager.png" >}}


### Security Hub {#security-hub}

Comprehensive view of your security state within AWS and your compliance with security industry standards and best practices.

-   **IMPORTANT:** Only for monitoring and analyzing. It cannot interact or solve any issue.

-   Uses service-linked roles.
-   Aggregates, organizes, and prioritizes security alerts, or findings, across multiple accounts, partner tools, and services such as GuardDuty, Inspector, Macie, IAM Access Analyzer, Firewall Manager, AWS Audit Manager.
-   Supports multiple security standards: FSBP, CIS, PCI DSS, NIST.


### Shield {#shield}

Managed DDoS protection service that safeguards applications running on AWS.

-   Protects from:
    -   Network volumetric attacks (L3) saturate Capacity
    -   Network protocol attacks (L4) tcp syn flood
    -   Application layer attacks (L7) web requests floods

-   Standard: included for all AWS customer.
    -   Protects from L3 and L4 attacks
    -   When used with R53, CF, and Global Accelerator, protection against infrastructure attacks.

-   Advanced: commercial product for enhanced protection.
    -   Not automatic, need to explicitly enable shield advanced or firewall manager shield advanced policy
    -   Cost protection (EC2 scaling) for unmitigated attacks
    -   Proactive Engagement &amp; AWS Shield Response Team (SRT)
    -   WAF integration, L7 DDoS protection
    -   Real time visibility of DDoS events and attacks
    -   Health-based detection: application specific health checks
    -   Protection groups


### WAF (Web Application Firewall) {#waf--web-application-firewall}

Protect web applications from attacks by allowing to configure rules that allow, block, or monitor web requests based on conditions.

-   **IMPORTANT:** Cannot be directly attached in-front of a ASG.
-   **IMPORTANT:** Logs can be directed into S3 (every 5 min), CW Logs, or Kinesis Firehose.

-   WAF Security Automations: automatically deploy a web ACL with a set of AWS WAF rules designed to filter common web-based attacks.

-   Priced per web ACL, per rule, and per requests
-   Intelligent Thread Mitigation
    -   Bot Control
    -   Captcha
    -   Fraud Control / Account takeover
    -   Marketplace rule groups

{{< figure src="./img/waf_layer_7.png" >}}

{{< figure src="./img/waf.png" >}}


#### Web ACL {#web-acl}

Set of rules withing rule groups that allow or deny incoming traffic.

-   **IMPORTANT:** Cannot be associated to outposts.
-   **IMPORTANT:** CF web ACL cannot associated to a regional and vice versa.

-   Created for CF or a regional service
-   Rules are grouped by rule groups and are processed in order
    -   WEB ACL Capacity Units are the units rules can take for requests (compute units to process the traffic)
    -   The default Web ACL CU (WCU) is 1500
-   1 resource can have only 1 web ACL, but 1 web ACL can have multiple resources


#### Rule Groups {#rule-groups}

Contain rules and are contained in web ACLs

-   Do not have default actions
-   Can be managed (aws or marketplace), custom, or service owned (shield &amp; firewall manager)
-   Rule groups can be reference by multiple web acls
-   When creating a rule group you provide the WCU capacity


#### Rules {#rules}

-   Type: Regular or rate-based
-   Statement: what to match or count all or what &amp; count
    -   Can match, origin country, ip , label, header, cookie, query parameter, URI path, query string, body (first 8192B only), HTTP method
    -   Can have single, and, or, not multiple statements
-   Action: block, allow (not for rate-based), count, captcha, custom response

-   Can block common attack patterns such as SQL injection, or cross-site scripting


#### Policies {#policies}

-   Resource Policies: used to limit the principal or account that can interact with WAF
-   Usage Plan: use to limit requests. You can add an API key to identify different clients.


### Artifact {#artifact}

Self-service central repository of AWS security and compliance reports and select online agreements.

-   To use organization agreements in AWS Artifact, the organization must be enabled for all features.
-   Artifact Reports: ISO, Service Organization Control (SOC) reports, Payment Card Industry (PCI) reports, and certifications that validate the implementation and operating effectiveness of AWS security controls.


### Audit Manager {#audit-manager}

Simplify risk management and compliance with regulations and industry standards.

-   **IMPORTANT:** Cannot consolidate findings from various AWS security services. Use Security Hub instead.

-   Continuously audits AWS usage to assess risk and compliance with regulations and industry standards.


## Management {#management}


### Managed Grafana {#managed-grafana}

Data visualization service for querying, correlating, and visualizing operational metrics, logs, and traces from multiple sources.

-   All logical Grafana server deployment, setup, scaling, and maintenance are handled by AWS.


### Managed Service for Prometheus {#managed-service-for-prometheus}

Managed monitoring service for container environments.

-   Integration with EKS, ECS and Distro for OpenTelemetry.
-   Use PromQL to obtain performance visibility using filter, aggregate, and alarm on metrics.


### Config {#config}

Fully managed service that provides you with an aws resource inventory, configuration history, and configuration change notifications to enable security and governance.

-   **IMPORTANT:** Does not prevent changes from happening, no protection. Not used for troubleshooting just assess, audit, and evaluate configurations.
-   **IMPORTANT:** Used for auditing of changes, compliance with standards.
-   **IMPORTANT:** Auto remediation feature automatically remediates non-compliant resources.

-   Regional service, but supports cross-region and cross-account aggregation.
-   Config records: details of changes to your aws resources to provide you with a configuration history, and stored to a s3 bucket you specify.
-   Configuration snapshot: point-in-time capture of all your resources and their configurations.
-   Config rules (aws managed or custom with lambda): rules run against any config changes which can be compliant or non compliant.
-   Receive notifications whenever a resource is created, modified, or deleted. integrations with sns or eventbridge.

{{< figure src="./img/config.png" >}}


### Auto Scaling {#auto-scaling}

Provision capacity on demand base on thresholds and self-healing based on a launch template.

-   Configured in CloudWatch but it is dependent on ELB for elasticity.


#### Scaling Policies {#scaling-policies}

-   Manual: adjusting the desired capacity manually.

-   Predictive: time base adjustment, used for known schedule.
    -   Can forecast future load demands by analyzing historical records.

-   Dynamic: rules that react to something and adjust the desired capacity.
    -   Simple: A rule based on a metric (i.e. CPU).
    -   Stepped: more detailed rules based on differences (multiple conditions) which is quicker and preferable.
    -   Tracking tracking: focuses on keeping a desired metric.
    -   SQS Queue: scaled based on the size of a SQS queue.

    -   **IMPORTANT:** To scale for sudden request (i.e. peak in sales) use scaling based on request count per target.


#### Health Checks {#health-checks}

-   EC2 (default): anything but the instance running is viewed as unhealthy
-   ELB (can be enabled): running and passing the ELB health check to be more precise (application awareness).
-   Custom: instances marked healthy or unhealthy by an external system.

-   Health check grace period (default 300s): delay before starting checking.


### Control Tower {#control-tower}

Configuring and managing multi-account environment

-   Orchestrates other AWS services such as Organizations IAM Identity Center, CloudFormation, Config, etc.

{{< figure src="./img/aws_control_tower.png" >}}


#### Lading Zone {#lading-zone}

Multi-account environment that is well-architected and adheres to security and compliance best practices.

-   Uses Organizations to manage accounts:
    -   Security OU - to log archive and audit accounts
    -   Sandbox OU - testing and less rigid security
-   SSO/Federation by Identity Center
-   Centralized Logging &amp; Auditing with CloudTrail and Config Logs
-   AWS Config and CloudFormation to administer resources
-   Monitoring and notifications with CloudWatch and SNS
-   End User account provisioning via Service Catalog


#### GuardRails {#guardrails}

High-level rule or policy that governs the environment.

-   Behaviour:
    -   Preventive: prohibits actions that result in policy violations.
        -   Uses SCPs.
    -   Detective: detects noncompliance resources and provides alerts
        -   Uses Config rules.

-   Guidance:
    -   Mandatory: always enforced
    -   Strongly recommended: enforce best practices.
    -   Elective: for niche requirements


#### Account Factory {#account-factory}

Automates and standardizes new account creation by account admins or end users (with appropriate permissions).

-   Shared accounts:
    -   Management account: used for billing, provisioning of accounts, and managing OUs and guardrails.
    -   Log Archive account: a repository for logs of API activities and resource configurations.
    -   Audit account: a restricted account for security and compliance teams.


#### Dashboard {#dashboard}

Single page oversight of the entire environment


### CloudWatch {#cloudwatch}

Monitoring tool for AWS resources and applications.

-   **IMPORTANT:** Use synthetic Canaries in CW Application Monitoring to monitor API endpoints on a schedule.

-   Ingestion, storage and management of metrics
-   Central monotoring and observability service for all AWS and other services.
-   Public service.

{{< figure src="./img/aws_cloudwatch_architecture.png" >}}


#### Components {#components}

-   Dashboards: centralized panes to see metrics and logs. They are global, not region-specific.
-   Metrics: data points generated from resources, allows to study the behavior of the systems
-   Triggers:
    -   In alarm: metric or expresssion outside the defined threshold.
    -   Ok: metric in threshold.
    -   Insufficient: metric just started or does not have sufficient data available
-   Alarms: watches a metric over a time period (states are alarm or ok).
-   Resolution: standard of 60s granularity, but can be high (1s) but expensive
-   Retention: time the datapoints are retained before deletion, they depend on the resolution.
    -   As data ages, its aggregated and stored for longer with less resolution.
-   Statistics: aggregation over a period (min, max, sum, average)
-   Percentile: Understand better the distribution of the data and avoid outliers

{{< figure src="./img/aws_cloudwatch_data_architecture.png" >}}


#### EventBridge {#eventbridge}

Replacement and a super set of CloudWatch Events.

-   Additional event busses and can be used for custom applications.
-   Event: json containing the details on that event.
-   Matching rules: they are trigger then they match a specific event
-   Scheduled rules: they are trigger in a specific schedule (certain date and time or ranges) (similar to cron)

{{< figure src="./img/eventbridge.png" >}}


#### CloudWatch Logs {#cloudwatch-logs}

Public service to store, monitor, and access logging data. For any log management scenarios.

-   **IMPORTANT:** Cannot be used to track external IPs for S3 user events. Check [Find IP from Object Level Requests](#find-ip-from-object-level-requests).
-   **IMPORTANT:** Cannot forward CW Log event from one account to another directly.
    -   Use subscription filters with Kinesis Data Streams, Firehose, or Lambda.

-   Used for AWS, on-premise, IOT or any application (native or with CWAgent system or custom application logging), also VPC Flow Logs, CloudTrail, and also Route53 logs DNS requests
-   Global services such as Route53 send the data to us-east-1
-   S3 Export: manually store data in S3. Can take up to 12 hours and not real time. Can only be encrypted with SSE-S3

{{< figure src="./img/aws_cloudwatch_logs.png" >}}

<!--list-separator-->

-  Components

    -   Log Event: it is a timestamp with a message (basic log unit)
    -   Log Stream: sequence of log events from one given resource from one given source (different instances)
    -   Log Groups: aggregation of logs streams of different sources for a given resource
        -   By default they log data indefenitivly
        -   Can adjust different permissions and encrypt with KMS
    -   Metric Filters: patter match to create a metric for CloudWatch

    -   Subscriptions: copy data somewhere else by a per log group basis, in real time

        -   Subscription Filter: patter with a destination, distribution and permissions

        {{< figure src="./img/aws_cloudwatch_logs_subscriptions.png" >}}

        {{< figure src="./img/aws_cloudwatch_logs_subscriptions_aggregations.png" >}}

<!--list-separator-->

-  CloudWatch Logs Insighes

    Interactively search and analyze log data in CW Logs.

    -   Perform queries to quickly and effectively respond to operational issues.
    -   If an issue occurs, identify potential causes and validate deployed fixes.


#### CloudWatch Agent {#cloudwatch-agent}

Collect more logs and system-level metrics from EC2 instances and on-premises servers.

-   Needs to be installed.
-   Retrieve custom metrics from your applications using StatsD and collectd.
-   Cloudwatch Metric Streams: create a continuous, near real-time stream of metrics to a destination of your choice.
    -   Send metrics to Datadog, New Relic, Splunk, Dynatrace, Sumo Logic, and S3.


### CloudTrail {#cloudtrail}

Log APIs calls/activities from AWS activities.

-   **IMPORTANT:** NO REALTIME, there is a delay. Withing 15 minutes.
-   **IMPORTANT:** Use advanced event selector options to save only specific data (i.e. S3 Object Lambda access points).

-   By default 90 days stored in Event History, at no cost
-   To customize the service, create 1 or more Trails
-   Regional service
-   File integrity validation: determine if a log file was modified, deleted or unchanged after CloudTrail delivered it.

{{< figure src="./img/aws_cloudtrail.png" >}}


#### Components {#components}

-   Trail: unit of configuration within CloudTrail
    -   Can be regional or global).

-   Global services such as (IAM, CloudFront, STS) always log the events on us-east-1.
    -   A trail must be created on that region to log that data.
-   Custom trails store events on S3 buckets or to CloudWatch Logs (can be both).

-   Organization trail will log all events for all AWS accounts in an organization.


#### Types of Events {#types-of-events}

-   Management Events: provide info of management operations performed on resources on the AWS accounts (known as control plane operations).
    -   By default CloudTrail only logs management events.
-   Data Events: provide info of resource operations performed on or in a resource (objects being uploaded to s3, or lambda invoked).
    -   They come at an extra cost and must be enabled manually.


### Trusted Advisor {#trusted-advisor}

Analyzes the AWS environment and provides best practice recommendations.

-   **IMPORTANT:** You are notified weekly by email with the recommendations.

-   Provides cost optimization, performance, security, fault tolerance and service limits.
-   Free version with 7 core check with basic and developer support plans, anything beyond requires business or enterprise


#### 7 Free Core Checks {#7-free-core-checks}

-   S3 Bucket permissions, not objects
-   Security Groups specific ports unrestricted
-   IAM use
-   MFA on root Account
-   EBS Public Snapshots
-   RDS Public Snapshots
-   50 service limit checks


#### Business &amp; Enterprise Support {#business-and-enterprise-support}

-   7 core checks and 115 further checks
-   Access via the AWS Support API
    -   Useful for example to check service limits and logging a support ticket automatically for an increase
-   CloudWatch integration: react to changes


### System Manager {#system-manager}

Centralize operational data from multiple AWS services and automate tasks across your AWS resources.

-   **IMPORTANT:** Use EC2Rescue tool to diagnose and troubleshoot problems with EC2 instances.
    -   Run it automatically with Systems Manager Automation and the "AWSSupport-ExecuteEC2Rescue" document.

-   For any system with the agent installed, it can manage inventory and patch assets.
-   Run commands &amp; manage desired state
-   Securely connect to EC2 even in private VPC via Session Manager.
-   Previously known as Simple Systems Manager.


#### Agent {#agent}

-   Systems Manager Endpoint is a Public service
-   Needs an agent installed on Windows or Linux AMIs.

{{< figure src="./img/systems_manager_agent.png" >}}


#### Run Command {#run-command}

Run commands documents on managed instances

-   **IMPORTANT:** AWS-RunPatchBaseline, apply patches from the patch manager for Linux and Windows instances
-   **IMPORTANT:** AWS-ApplyPatchBaseline, apply patche to Windows instances

-   No SSH/RDP access required.
-   Can run on instances, tags or resource groups.
-   Command documents can be reused and can have parameters.
-   Rate control: concurrency &amp; error threshold
-   Output options to S3 or SNS

{{< figure src="./img/systems_manager_run_command.png" >}}


#### Patch Manager {#patch-manager}

Apply patches to your managed infrastructure.

-   **IMPORTANT:** Linux: AWS-(OS)DefaultPatchBaseline, explicitly define patches
-   **IMPORTANT:** Windows: AWS-DefaultPatchBaseline / AWS-WindowsPredefinedPatchBaseline-OS for critical and security updates
-   **IMPORTANT:** Windows: AWS-WindowsPredefinedPatchBaseline-OS-Applications same as above but with MS apps updates

-   Patch baseline: what patches and hot fixes should be installed
    -   Predefined for various OS, but you can create your own
-   Patch groups: what systems you want to apply the patch to
-   Maintenance Windows: time frames slots where patching can take place
-   Concurrency &amp; Error Threshold, same as run command
-   Compliance: uses the System Manager Inventory feature to manage the state of the final infrastructure

{{< figure src="./img/systems_manager_patch_manager.png" >}}


### Tag Editor {#tag-editor}

Add tags to multiple, supported resources at once

Best practices for tag names:

-   Use all lowercase for the words.
-   Use hyphens to separate words.
-   Use a prefix followed by a colon to identify the organization name or abbreviated name.


### Licence Manager {#licence-manager}

Service for centrally managing software licenses across AWS and on-premises environments.

Supports a variety of licensing models:

-   Perpetual: lifetime license with no expiration date.
-   Floating: shareable licenses.
-   Subscription: license with expiration date.
-   Usage-based license with specific terms based on usage.


### Billing &amp; Cost Management Console {#billing-and-cost-management-console}

-   Billing group: set of accounts within a consolidated billing family.
    -   Primary Account can see the cost and usage across its billing group.


#### Cost Explorer {#cost-explorer}

Default report to visualize the costs and usage of the **TOP FIVE** cost-accruing services and a detailed breakdown of all services in the table view.

-   View data for up to the last 12 months, forecast spend for the next three months and get recommendations on RIs.
-   Must be enabled before it can be used. Can be done only by the owner (root account).
-   In an org, enabling CE enables it for all accounts. You can’t grant or deny access individually.
-   Create forecasts that predict usage for a specific time range.

<!--list-separator-->

-  Cost Allocation Tags

    Provide additional information for billing reports

    -   Need to be enable individually (per account for standard accounts or org master for orgs).
    -   Visible in cost reports and can be used as filters.
    -   Up to 24 hours to be visible and active.

    Types

    -   AWS Generated: added to resources after they are enabled (i.e. aws:createdBy, aws:cloudformation:stack-name)
    -   User Defined: (i.e. user:example)


#### Budgets {#budgets}

Set custom budgets for tracking spending and usage and **alert** when current or foretasted usage is exceeded via email and/or SNS.

-   **IMPORTANT:** Can use budgets to run actions when they are exceeded. They can be run automatically or after manual approval.
    -   Actions can be applying IAM policies or SCPs. Can target specific resources.

-   Updated up to three times a day.

Types of Budgets:

-   Cost budgets: plan how much to spend on a service.
-   Usage budgets: plan how much to use one or more services.
-   RI utilization budgets: define a utilization threshold and receive alerts when your RI usage falls below.
-   RI coverage budgets: define a coverage threshold and receive alerts when the number of your instance hours that are covered by RIs fall below that threshold.


#### Cost &amp; Usage Reports {#cost-and-usage-reports}

CSV file or collection which provides information about your use of resources and estimated costs for that usage (stored in S3).

-   Track RI Utilization, charges, and allocations.
-   Time granularity: hourly daily, monthly
-   Can be automatically uploaded into Redshift and/or QuickSight for analysis.


#### Cost Anomaly Detection {#cost-anomaly-detection}

Feature that uses ML to detect and alert anomalous spend patterns.

-   Receive alerts in aggregated reports via email.
-   Cost data evaluated weekly, monthly, or in custom timeframes.


#### Billing Conductor {#billing-conductor}

Feature that simplifies the billing and reporting process with customizable pricing and cost visibility.

-   Aggregated view of the monthly cost and usage data across the accounts.


### Compute Optimizer {#compute-optimizer}

Recommends optimal AWS resources to reduce costs and improve performance of your workloads.

-   Uses ML to analyze historical utilization metrics to view findings and recommendations across regions and accounts.
-   Provides graphs for recent utilization metric, projected utilization for recommendations
-   Supported resources: EC2, ASG, EBS, Lambda, ECS on Fargate, commercial software licenses.


#### Enhanced Infrastructure Metric {#enhanced-infrastructure-metric}

Paid feature for EC2 that extends the utilization metric analysis from 14 days to 93 days.


#### Inferred Workload Type {#inferred-workload-type}

Identify the effort to migrate workloads from x86-based to Arm-based AWS Graviton instances types.


#### Delegated Administrator {#delegated-administrator}

Member account in the ORG as an administrator (max one per org)

Capabilities:

-   Get and export recommendations
-   Get projected utilization metrics
-   Set recommendation preferences
-   Set member account opt-in status


#### Exporting Recommendations {#exporting-recommendations}

-   Individual CSVs for each resource type and regions.
-   Can be exported to S3
-   Can be done with the API endpoint of "Export&lt;Resource&gt;Recommendations", and to verify the final status of the export job use "DescribeRecommendationExportJobs".


## Analytics {#analytics}


### Athena {#athena}

Serverless service to analyze data directly in Amazon S3 and other data sources using SQL.

-   Schema-on-read (table like translation) that runs queries in <span class="underline">parallel</span> (original data never changes).
-   Supports different data formats such as CSV, JSON, ORC, Avro, or Parquet.
-   Query non-s3 sources with Athena Federated Query with data source connectors that run on Lambda.
    -   Data source connector: piece of code that translate non s3 data and Athena (examples like DynamoDB, DocumentDB, CloudWatch Logs, RDS, PostgreSQL, MySQL, etc.)

{{< figure src="./img/athena.png" >}}


#### Cost Controls {#cost-controls}

Can isolate queries for teams, apps, or different workloads to enforce cost controls.

-   Per-query limit: threshold for the total amount of data scanned per query.
-   Per-workgroup limit: limits the total amount of data scanned by all queries running within a specific time frame.


#### Performance Tuning Tips {#performance-tuning-tips}

From most important to least.

-   Partition your data on column values such as date, country, and region.
-   Compression
    ![](./img/athenea_performance_compression_table.png)
-   Make files splittable (Apache Parquet and Apache ORC):
    -   Only text files (TSV, CSV, JSON, and custom SerDes for text) compressed with BZIP2 and LZO are splittable.


#### Extra {#extra}

-   Pay only on data consumed, ad-hoc queries on data

-   Used for:
    -   Queries where loading/transformation is not desired
    -   Occasional/Ad-hoc queries on data in s3
    -   Serverless querying scenarios - cost conscious
    -   Querying AWS logs such as VPC Flow logs, CloudTrail, ELB logs, cost reports, etc.
    -   Support with AWS Glue Data Catalogs &amp; Web Server logs


### Kinesis {#kinesis}

Collect, process, and analyze real-time, streaming data.

-   Ingest real-time data such as video, audio, app logs, website clickstreams, and IoT telemetry data for ML, analytics, and other app.


#### Kinesis Data Streams {#kinesis-data-streams}

Massively scalable, highly durable data ingestion and processing service optimized for streaming data.

-   **IMPORTANT:** Use enhanced fan-out if multiple consumers retrieve data from a stream in parallel.
-   **IMPORTANT:** Cannot stream data directly to Redshift or S3. Need to use Kinsesis Data Firehose.
-   **IMPORTANT:** Does not support plug-and-play integration with Lambda for intermediary data manipulation.

-   Public service &amp; HA by design.
-   Used in data ingestion with multiple consumers, analytics, monitoring, app clicks, or mobile click streams.
-   Real time data delivery (around 200ms).
-   To increase the capacity, split the shards.

{{< figure src="./img/kinesis_data_streams.png" >}}

<!--list-separator-->

-  Components

    -   Data producer: app that emits data records to a Kinesis data stream.
        -   Assign partition keys to records which determine which shard ingests the data record.
    -   Data consumer: service retrieving data from all shards in a stream.
        -   Usually they receive the most recent data in a shard for real-time analytics or handling of data.
    -   Data Stream: logical grouping of shards.
        -   Will retain data for 24 hours, or up to 7 days with extended retention, or up to 365 days with long-term retention.

    -   Shard: base throughput unit of a Kinesis data stream.
        -   Contains an ordered sequence of records ordered by arrival time.
        -   Consumers with enhanced fan-out: one shard provides 1MB/sec data input and 2MB/sec data output for that consumer.
        -   Consumers without enhanced fan-out: a shard provides 1MB/sec of input and 2MB/sec of data output shared with any consumer not using enhanced fan-out.
    -   Data record: unit of data stored in a Kinesis stream. Composed of a sequence number, partition key, and data blob (1 MB max size).
    -   Partition key: meaningful identifier, such as a user ID or timestamp specified by data producer.
        -   Used also to segregate and route data records to different shards of a stream.
    -   Sequence number: unique identifier for each data record assigned by Kinesis Data Streams data producer calls PutRecord or PutRecords API.

<!--list-separator-->

-  Kinesis Agent

    Stand-alone Java software application that offers an easy way to collect and send data to Kinesis Data Streams or Kinesis Firehose.

    -   **IMPORTANT:** If the agent publishes to Kinesis Data Streams, it cannot publish to Firehose and must do it through Kinesis Data Streams.

    -   Continuously monitors a set of files and sends new data to your stream.
    -   Handles file rotation, checkpointing, and retry upon failures.
    -   Delivers all the data in a reliable, timely, and simple manner.
    -   Emits CloudWatch metrics to monitor and troubleshoot the streaming process.

<!--list-separator-->

-  Kinesis Client Library

    Library that takes care complex tasks of distributed computing to consume and process data from a Kinesis Data Stream.

    -   **IMPORTANT**: Each KCL application must use its own DynamoDB table.
    -   **IMPORTANT:** A DynamoDB table must be used for KCL checkpointing.

    -   Load balances across multiple consumer application instances, responding to consumer application instance failures, checkpointing processed records, and reacting to resharding.

<!--list-separator-->

-  Kinesis Producer Library


#### Kinesis Data Firehose {#kinesis-data-firehose}

Easiest way to load streaming data into data stores and analytics tools in near real-time (delay of 60s).

-   **IMPORTANT**: to copy data to Redshift, first copy to a S3 bucket first, and then issue a Redshift COPY command.

-   Fully managed ETL service with automatic scaling.
-   Can batch, compress, and encrypt data before loading (with lambda).
-   Deliver data to HTTP, Redshift, Elasticsearch, S3 bucket, and service providers (Datadog, New Relic, MongoDB and Splunk).

{{< figure src="./img/kinesis_data_firehose.png" >}}

<!--list-separator-->

-  Components

    -   Delivery stream: underlying entity.
    -   Record: data of interest that data producer sends to a delivery stream. (Max size 1MB)
    -   Data producer: send records to delivery streams (Kinesis Data Steams, Kinesis Agent, org Kinesis Data Firehose API can be used).
        -   Can use CloudWatch Logs, CloudWatch Events, AWS IoT, or Amazon SNS as data source.
        -   Some services can only send to delivery streams in the same Region.
    -   Buffer size and buffer interval: size and interval it waits to deliver data to the destination (default 1MB and 60s).

<!--list-separator-->

-  Extra

    -   Persist data from a Kinesis Data Stream (i.e. to S3) or it can be attached to data streams as a customer directly.
    -   Convert incoming JSON to Parquet or ORC formats before sending.


#### Kinesis Data Analytics {#kinesis-data-analytics}

Serverless real-time data analytics and processing using complex SQL

-   Ingests from Kinesis Data Streams or Firehose (can pull in static reference data from S3 for queries)
-   Destinations: Kinesis Data Streams, Firehose (all destinations) and Lambda
-   Application error stream for error catching
-   Used in time-series analytics, real-time dashboards, or real-time metrics.
-   Advanced analytics such as anomaly detection and top-K analysis on your streaming data.

{{< figure src="./img/kinesis_data_analytics.png" >}}

<!--list-separator-->

-  Extra

    -   Only pay for the data process by the application (not cheap)
    -   Kinesis Analytics Application is the middleware between source and destination streams where SQL queries are performed.
    -   Reference table is used to match data contained in a S3 bucket to enrich the data; for example, metadata from the identity of the data streams)
    -   Includes open source libraries based on Apache Flink for exactly <span class="underline">once processing</span>.


#### Kinesis Video Streams {#kinesis-video-streams}

Fully managed service (serverless) to stream live video from devices to the Cloud or build app for real-time video processing or batch-oriented video analytics.

-   **IMPORTANT:** GetHLSStreamingSessionURL for mobile phones and live playback
-   **IMPORTANT:** GetDASHStreamingSessionURL for media players

-   GetMedia API: real-time API with low latency to process Kinesis video streams.

<!--list-separator-->

-  Components

    -   Producer: any source that puts data into a Kinesis video stream.
    -   Kinesis video stream: resource to transport live video data, optionally store it
        -   Make the data available in real time and on a batch or ad hoc basis.
    -   Consumer (known as KVS apps): gets data, such as fragments and frames, from a Kinesis video stream to view, process, or analyze it.

<!--list-separator-->

-  Extra

    -   Consumers can access data frame-by-frame or as needed
    -   Cannot access directly the data via storage, only via APIs
    -   Integrates with other AWS services such as Rekognition and Connect
    -   TLS based encryption on data streaming from devices, and encrypts all data at rest using AWS KMS.

    Use cases:

    -   Connect and stream from millions of devices,
    -   Durably store media data for custom retention periods.
    -   Build real-time and batch applications on data streams.


### CloudSearch {#cloudsearch}

Fully-managed service in the AWS Cloud to set up, manage, and scale a search solution for a website or app.

-   Can index and search both structured data and plain text.
-   Integration with API Gateway.
-   Uses language-specific text processing for full text search (34 languages for highlighting, autocomplete, and geospatial search)
-   Scaling for traffic (domain depth, more instances) or scaling for Data (domain width, bigger instances).


### OpenSearch (before Elasticsearch (ES)) {#opensearch--before-elasticsearch-es}

Search and analytics engine to search, analyze, and visualize your data in **real-time**.

-   Managed implementation of OpenSearch (Previously ELK stack, ES (search and indexes), Kibana (visualization and dashboards) and Logstash (logs, needs agent installed))
-   Not serverless, runs in a VPC using compute but is managed by AWS.
-   Uses a blue/green deployment process when updating domains.
-   Deploy across multiple AZs (up to three). If replicas for your indexes are enabled, shards will automatically be distributed for cross-zone replication.
    -   Dedicated master nodes across 3 AZs (even if less AZs are configured).

{{< figure src="./img/elasticsearch.png" >}}


#### Extra {#extra}

-   Uses Amazon Cognito to offer username and password protection for Kibana.

Used for:

-   Logs analytics, monitoring, security analysis
-   Full text search and indexing
-   Click-stream analytics
-   Security intelligence
-   Business analytics and operational intelligence


### EMR (Elastic Map Reducer) {#emr--elastic-map-reducer}

Managed implementation of Apache Hadoop for handling big data workloads using Map Reduce Framework.

-   It also has other frameworks such as Spark, HBase, Presto, Flink, Hive, Pig, etc.
-   Use to transform and move large amounts of data into and out of other AWS data stores and databases (S3, HDFS, DynamoDB).
-   Runs in 1 AZ in a VPC using EC2 for compute, not HA (not regionally resilient)

{{< figure src="./img/emr.png" >}}


#### Components {#components}

-   Clusters: collection of EC2 instances, can be transient or long-running.
-   Nodes: minimum unit of compute (EC2 instance)

-   Master node: manages the cluster and monitors its health, distributes and tracks the status of workloads
    -   Each cluster has at least 1 master node, can be the only node in a cluster.
    -   Can be connected with SSH
    -   If it fails, the whole cluster fails
    -   Up to 3 master nodes for HA of the services can be launched (automatic failover over master nodes).
    -   If use spot for master, use spot for anything else (short term),

-   Core nodes: data nodes for HDFS, run tasks trackers and can ran mapping and reduce tasks
    -   Clusters can have zero or more core nodes
    -   Multi-node clusters have at least one core node.

-   Tasks nodes: run the tasks, ideal for **spot based scaling**.
    -   Optional, no HDFS involvement or task trackers


#### Architecture {#architecture}

-   Storage: includes different file systems that are used with your cluster.
    -   HDFS: distributed, scalable file system for Hadoop.
        -   **Ephemeral storage**, useful for caching intermediate results or workloads with really high random I/O.
        -   Distributed storage of data among instances for data protection against instance failure.
    -   EMRFS: EMR extends Hadoop to directly be able to access data stored in S3 as if it were a file system.
        -   Resilient to core node failures.
    -   Local File System: instance store of EC2 instances.

-   Cluster Resource Management: managing cluster resources and scheduling the jobs for processing data.
    -   By default, uses YARN.

-   Data Processing Frameworks: engine used to process and analyze data.
    -   Hadoop MapReduce: programming model for distributed computing.
    -   Apache Spark: cluster framework and programming model for processing big data workloads.


### MSK {#msk}

Fully managed Apache Kafka service to ingest and process streaming data in real-time.

-   MSK Connect: stream data to and from Apache Kafka clusters.
-   Serverless options with integration with PrivateLink.


### Quicksight {#quicksight}

Managed business analytics service to build visualizations, perform ad-hoc analysis, and quickly get business insights from their data, anytime, on any device.

-   **IMPORTANT:** It does not query directly from S3. It must either create a dataset or use Athena.
-   **IMPORTANT:** The smallest data refresh interval for SPICE is 15 min.

-   Provides ML Insights for discovering hidden trends and outliers, identify key business drivers, and perform powerful what-if analysis and forecasting.
-   Visualization, ad-hoc analysis
-   Per session pricing (people that consume data from dashboards pay per 30 min block of time per month)
-   Discovery and integration with AWS data sources and works with external services such as:
    -   Athena, Aurora, Redshift, Redshift Spectrum, S3, AWS IOT
    -   Jira, GitHub, Twitter, SalesForce
    -   Micrsoft SQL Service, MySQL, PostgreSQL
    -   Apache Spark, Snowflake, Presto, Teradata


#### Enterprise {#enterprise}

**IMPORTANT:** Need to be added to a subnet. Usually provision a private subnet and allow necesary connections in SG and NACL.

-   Fully integrated with VPC service. It attaches a EIN to the VPC.
-   ENI are created in the VPC side and not the QuickSight side
-   You create a VPC connection in QuickSight inside a subnet (can create NACLs, SGs, and RTs)

-   Features:
    -   ML Insights
    -   Embedded analytics in applications and portals:
    -   Security and governance
    -   User authentication and management options


### Redshift {#redshift}

A fully managed, petabyte-scale data warehouse service used for long term analysis and trending.

-   **IMPORTANT:** To enable cross-region snapshot copy for an KMS-encrypted cluster, you must configure a **snapshot copy grant** for a master key in the destination region
    -   So that Amazon Redshift can perform encryption operations in the destination region.
-   **IMPORTANT:** Use federated query to query data directly from other DBs without needing to load it to Redshift.
-   **IMPORTANT:** Audit logging used to create and upload logs to S3. Disabled by default.
    -   Can only use SSE-S3 encryption (AES-256) for audit logging.

-   OLAP database (column based) used to analyze and aggregate complicated queries on historical data.
-   Massively parallel processing data warehouse architecture to parallelize and distribute SQL operations.
-   Uses result caching to deliver sub-second response times for repeat queries.
-   Data can be loaded from s3, DynamoDB, Firehose, and Database Migration Service from other data sources
    -   Can unloaded to s3

{{< figure src="./img/redshift.png" >}}


#### Components {#components}

-   Cluster: a set of nodes, which consists of a leader node and one or more compute nodes.
    -   Leader node: manager of the cluster and is where you access Redshift.
        -   Used for query input, planning and aggregation.
    -   Compute node: performs queries of data from the leader node.
    -   Node Types:
        -   Dense storage (DS): for large data workloads and use hard disk drive (HDD) storage.
        -   Dense compute (DC): optimized for performance-intensive workloads. Uses SSD storage.

-   Data is replicated to 1 additional node when written, for resilience to HW failure.


#### Enhanced VPC Routing {#enhanced-vpc-routing}

Use VPC features to manage the flow of data between your cluster and other resources.

-   Can also use VPC flow logs to monitor COPY and UNLOAD traffic.
-   By default, public routes are used, but with Enhanced VPC Routing you can use PrivateLink or VPC gateways.


#### Redshift Spectrum {#redshift-spectrum}

Query data from s3 without the need to load or transform any data. Useful for large data sets

-   Supports Enhanced VPC Routing.
-   If data is stored in a columnar format, Redshift Spectrum scans only the columns needed by your query, rather than processing entire rows.
-   Data ca be compressed using one of Redshift Spectrum's supported compression algorithms, so less data is scanned.


#### Streaming Ingestion {#streaming-ingestion}

Consume and process data directly from a streaming source to a Redshift cluster using SQL.

-   Eliminates the need for staging data in Amazon S3, which gives you a low-latency, high-speed ingestion.
-   Valid data source: Kinesis Data Streams and MSK


#### Redshift ML {#redshift-ml}

Train and deploy ML models using the data stored in a Redshift cluster through a simple CREATE MODEL SQL statement.

-   Make in-database local inferences using SQL, eliminating the need to move data between Redshift and other storage services like Amazon S3.
-   Uses Amazon SageMaker Autopilot behind the scenes to find the best model based on your input data.


#### Data Sharing {#data-sharing}

Secure way to share live data across Redshift clusters within an AWS account, without the need to copy or move data.

-   Provides live access to the data so that users always see the most up-to-date and consistent information as it is updated in the data warehouse.
-   Can be used on Redshift RA3 clusters at no additional cost.


#### Cross-Database Query {#cross-database-query}

Ability to query across databases in a Redshift cluster, regardless of which database you are connected to.

-   Available on Redshift RA3 node types at no additional cost.


#### Cluster Snapshots {#cluster-snapshots}

Point-in-time backups of a cluster stored in S3.

-   Cross region for global resilience.

-   Automatic incremental snapshots to s3 every 8 hours or every 5GB of data
    -   Enabled by default.
    -   Free storage of the same storage capacity of the cluster for snapshots.
    -   1 day retention period but configurable up to 35 days

-   Manual snapshots to S3 managed by the admin
    -   Can be shared with other AWS accounts.


### Glue {#glue}

Fully managed service to extract, transform, and load (ETL) your data for analytics.

-   Consists of: Central metadata repository, ETL engine, flexible scheduler.
-   Crawls data sources and generates the AWS Glue Data catalog
-   Data Sources:
    -   Stores: S3, RDS, JDBC Compatible &amp; DynamoDB
    -   Streams: Kinesis Data Stream &amp; Apache Kafka
-   Data Targets: S3, RDS, JDBC Databases

-   Use cases:
    -   Run queries against an Amazon S3 data lake.
    -   Analyze the log data in your data warehouse.
    -   Create event-driven ETL pipelines.
    -   A unified view of your data across multiple data stores.

{{< figure src="./img/glue.png" >}}


#### Data Catalog {#data-catalog}

Persistent metadata store about data sources

-   One catalog per region per account
-   Avoid data silos, all data is available to the whole team, improves the visibility of data across an organization
-   Can be used with Amazon Athena, Redshift Spectrum, EMR &amp; AWS Lake Formation
-   They are created by configuring crawlers for data sources and giving them permission to publish data to data catalog


#### Databrew {#databrew}

Visual data preparation tool for cleaning and normalizing data to prepare it for analytics and ML.

-   Over 250 pre-built transformations to automate data preparation tasks.
    -   Automate filtering anomalies, converting data to standard formats, and correcting invalid values, and other tasks.
    -   Auto-generate 40+ data quality statistics like column-level cardinality, numerical correlations, unique values, standard deviation, and other statistics.


#### Flex {#flex}

Optimize costs on non-urgent or non-time sensitive data integration workloads.

-   Flex jobs run on spare compute capacity instead of dedicated hardware.


#### Data Quality {#data-quality}

Measure and monitor the quality of your data for making good business decisions.

-   Built on top of the open-source DeeQu framework and provides a managed, serverless experience.


#### Ray {#ray}

Scale Python workloads using Ray, an open-source unified compute framework.


#### Pricing {#pricing}

-   Hourly rate based on the number of DPUs used to run your ETL job.
-   Hourly rate based on the number of DPUs used to run your crawler.

-   Data Catalog storage and requests:
    -   Charged per month if you store more than a million objects.
    -   Charged per month if you exceed a million requests in a month.


### Lake Formation {#lake-formation}

Service for managing and building data lakes.

-   Stores and catalogs data from databases and object storage before transferring it to a new S3 data lake.
-   Use ML algorithms to clean and classify data and secure access to sensitive data with granular controls at the column, row, and cell levels.


### Data Pipeline {#data-pipeline}

Managed ETL service for scheduling regular data movement and data processing activities in the AWS cloud.

-   Built-in activities for common actions such as copying data between Amazon Amazon S3 and Amazon RDS or running a query against Amazon S3 log data.
-   Supports JDBC, RDS, and Redshift databases.


### Data Exchange {#data-exchange}

Search, subscribe to, and use third-party data in the cloud.

-   Central catalog where data providers may publish their data products, and data subscribers can search and subscribe to them.


## Development &amp; Deployment {#development-and-deployment}


### Types Of Deployments {#types-of-deployments}


#### Blue/Green {#blue-green}

Create a testing environment and route user to it, if everything works correctly, migrate all users to the green and if that continues delete the blue and make the green the primary.

{{< figure src="./img/cicd_blue_green_deployment.png" >}}


#### Rolling {#rolling}

Slowly replaces previous versions of an application with new versions of an application by completely replacing the infrastructure on which the application is running.


#### In-Place {#in-place}

Updates the application version without replacing any infrastructure components. The previous version of the application on each compute resource is stopped, the latest application is installed, and the new version of the application is started and validated.


#### Canary {#canary}

Incrementally deploy the new version, making it visible to new users in a slow fashion. As you gain confidence in the deployment, you will deploy it to replace the current version in its entirety.


### CodePipeline {#codepipeline}

Fully managed continuous delivery service used to automate release pipelines for application and infrastructure updates.

-   Built from stages which can have sequential or parallel actions.
-   Movement between stages can require manual approval.
-   Artifacts can be loaded into an action, and generated from an action.
-   Stage changes are published to the EventBridge bus (success, failed, canceled)
-   Supports VPC endpoints. Can connect directly to CodePipeline through a private endpoint in a  VPC, keeping all traffic inside AWS.

{{< figure src="./img/codepipeline.png" >}}


### CodeBuild {#codebuild}

Fully managed CI service that compiles source code, runs tests, and produces software packages that are ready to deploy.

-   Used for builds and tests.
-   Uses docker for build environments which they can be customized.

-   S3 caching: stores the cache in a S3 bucket that is available across multiple build hosts.
    -   Good option for small to intermediate sized build artifacts that are more expensive to build than to download.
    -   Also a good option with Docker layers.

{{< figure src="./img/codebuild.png" >}}


#### Buildspec.yaml {#buildspec-dot-yaml}

File where the build process is defined (root of the source).

-   Phases:
    1.  Install: installs packages in the build environment (frameworks etc.)
    2.  Pre_build: sign-in to things or install dependencies
    3.  Build: commands run during the build process
    4.  Post_build: package things up, push docker images, explicit notifications

-   Environment variables can be used through shell, variables, parameter-store, secrets-manager


### CodeDeploy {#codedeploy}

Fully managed deployment service that automates software deployments to EC2, Fargate, Lambda, and on-premises servers.

-   **IMPORTANT:** Protects app from downtime during deployments through rolling updates and deployment health tracking.
    -   In-place deployments: instances are stopped, and the app is installed, validated and started.
    -   Blue/green deployments: once the new version is tested, it shifts traffic from the old to the new version.

-   Deploys code not resources, can deliver code to EC2, On-premise, lambda functions, ECS
-   Nedd to install the CodeDeploy agent in the EC2 and on-premises instances.


#### Appspec.yaml {#appspec-dot-yaml}

It is a YAML or JSON file which controls how deployments occur on the targets of that deployment.

-   Manages deployments = config + lifecycle event hooks
-   Config:
    -   Files: only for EC2 and on-premises
    -   Permissions: only for EC2 and on-premises
    -   Resources: only for ECS and Lambda
-   Lifecycle event hooks: ApplicationStop, DownloadBundle, BeforeInstall, Install, AfterInstall, ApplicationStart, ValidateService


### CodeCommit {#codecommit}

Fully-managed source control service that hosts secure Git-based repositories

-   Stores repositories in S3 and DynamoDB.


### CloudFormation {#cloudformation}

Service to create a collection of related AWS resources and provision them in an orderly and predictable fashion.

-   Rollback Triggers: specify alarms and if they are breached, CF rolls back the entire stack operation to a previously deployed state.
-   Template: YAML or JSON document that contains logical resources (what)


#### Stacks {#stacks}

Group of resources that share the same lifecycle (limit of 500 resources per stack)

-   Designed isolated by default; can't easily reuse resources or reference other stacks

<!--list-separator-->

-  Nested Stacks

    Stacks created as part of other stacks defined by "AWS::CloudFormation::Stack".

    -   **IMPORTANT**: Use ONLY when stacks form part of one solution (life-cycle linked).
    -   Root stacks can reference the outputs of other stacks, and be passed as parameters to other stacks.
    -   Used for overcoming the 500 resource limit of one stack, or having a modular templates for code reuse.

    -   Root Stack: top-level stack to which all the nested stacks ultimately belong.
    -   Parent Stack: higher level stack in the stack hierarchy.

<!--list-separator-->

-  Cross-Stack References

    Export values from one stack and use them in another (use "<:ImportValue>" to reference exports).

    -   **IMPORTANT**: Exports must have a unique name in the region
    -   **IMPROTANT**: Use for service oriented where they have different life-cycles and you want to reuse stacks.

<!--list-separator-->

-  Stack Sets

    Deploy CFN stacks **across many accounts &amp; regions**.

    -   They are containers in an admin account that contain stack instances which reference other stacks.
    -   Permissions are granted via self-managed IAM Roles or service-managed within an ORG.
    -   Used for enabling AWS config, config rules, iam roles in multiple accounts or deployments on multiple accounts and regions.

<!--list-separator-->

-  Stack Roles

    Allows CFN to assume a role to be able to interact with AWS to create, delete, update resources.

    -   **IMPORTANT**: the identity creating the stack does not need to have resource permissions only "PassRole".
    -   Used for role separation

<!--list-separator-->

-  Change Sets

    Preview changes between different versions of a stack

    -   Chosen changes can be applied by executing the change set.
    -   More control and visibility over changes of a stack.

<!--list-separator-->

-  Extra

    -   Configurations:
        -   Concurrent Accounts: number of accounts that can be deployed at any time
        -   Failure tolerance: amount of resource that can fail before the Stack Set fails
        -   Retain Stacks: remove or retain stack instances from the Stack Sets

    -   Types of Permissions:
        -   Self-Managed: users have to select the specific AWS accounts in specific regions manually
        -   Service-Managed: can be deployed to all accounts managed by AWS organizations in specific regions


#### Deletion Policy {#deletion-policy}

Action that CFN takes for the physical resource when the logical resource is deleted

-   **IMPORTANT**: Only applies to delete not replace (with replace the data will be lost)
-   Options: delete (default), retain or if supported snapshots (EBS, ElastiCache, Neptune, RDS, Redshift)
    -   Snapshots must be manually deleted


#### Custom Resources {#custom-resources}

Integrate with anything CF doesn't yet or does not natively support

-   Passes and get data from custom resources.
-   Lambda can be used to add additional steps.


#### Parameters {#parameters}

<!--list-separator-->

-  Template Parameters

    Allow external sources (console/CLI/API) to accept inputs when a stack is created or  updated

    -   They can be reference from within logical resources to influence physical resources and/or configuration
    -   Can configure defaults, allowed values, min and max length &amp; allowed patterns, noecho (not visible when is types, used for passwords) &amp; type (string, list, vpc, subnets, etc)
    -   They need to be defined in the parameter section
    -   Whenever possible use defaults

<!--list-separator-->

-  Pseudo Parameters

    -   They are injected parameters from AWS which do not have to be defined in the parameter section (example AWS::Region, AWS::StackId, AWS::StackName, AWS::AccountId)
    -   Provided by AWS based on the environment when creating the stack


#### Intrinsic Functions {#intrinsic-functions}

Allow access to data and runtime and take action based on how things are based on templates when the stack is being created

-   **IMPORTANT:** Can be used only in specific parts of a template such as resource properties, outputs, metadata attributes and update policy attributes.

<!--list-separator-->

-  Ref and <:GetAttr>

    -   Ref: use to get the main value of a logical resource and reference it (ImageId: !Ref LatestAmiID)
    -   Physical attributes can be referenced in the template once the physical resource is created. Using !Ref on template on pseudo parameters returns their value.
        -   When used with logical resources, the physical ID is usually returned
    -   !GetAtt can be used to retrieve any attribute associated with the resource (!GetAtt PublicIp, or !GetAtt PublicDnsName)

<!--list-separator-->

-  <:GetAZs> and <:Select>

    -   <GetAZs>: from a specific region returns a list of AZs on a explicit region or the current region if blank
        -   If you have a default VPC, it will return the AZ where the default VPC has subnets in
    -   <:Select>: returns an object from a lists of objects given an index (it starts at 0) (!Select [0, !GetAz ''])

<!--list-separator-->

-  <:Join> and <:Split>

    -   <:Split>: given a delimiter it splits a string into a list (!Split ["|", "roffle|truffles|penny"])
    -   <:Join>: given a delimiter and a list of values, it joins the list into a string with the delimiter (!Join ["|", ["value1", "value2"]])

<!--list-separator-->

-  <:Base64> and <:Sub>

    -   <:Base64>: given plain text, it encodes it to base64 (<:Base64>: "data")
    -   <:Sub>: substitutes variable in the input to their actual runtime values (!Sub "hello ${Instance2.InstanceId}")
        -   Cannot do self references as the physical resource is not created yet

<!--list-separator-->

-  <:Cidr>

    -   Function to create and reference cidr ranges for subnets, it returns an list with all the available cidr ranges (!Select [ "0", !Cidr [ !GetAttr VPC.CidrBlock, "16, "12" ]])


#### Mappings {#mappings}

Maps keys to values allowing lookup, used to improve template portability

-   They can have on key, or Top &amp; Second level mappings
-   Mappings use the !FindInMap function

{{< figure src="./img/cloudformation_mappings.png" >}}


#### Outputs {#outputs}

Provides status information to access services created by the stack (when stack is in CreateComplete state) and are optional on templates

-   Useful as they are accessible to the parent stack when using nesting
-   Can be exported allowing cross-stack references


#### Conditions {#conditions}

Evaluated to true or false, and are processed before resources are created

-   Declared in the optional 'Condition' section
-   They use intrinsic functions (and, equals, if, not, or) and are associated to logical resource to control if they are created or not


#### DependsOn {#dependson}

-   Lets you explicitly define the dependencies of the resources
    -   On creation, the resource that depends on the other waits for it parent to be created
    -   On deletion, the resource that depends on the other is deleted first and then the parent
-   Elastic IPs requries a IGW attached to a VPC to work but as no there is no implicit dependency then we need to add a DependsOn for the IGW attachment
-   You can link explicit dependencies in single resources or a list of resources


#### Wait Conditions &amp; Cfn-Signal {#wait-conditions-and-cfn-signal}

-   Configure CFN to wait for 'X' number of success signals or a timeout for the signals (max 12h)
    -   If success signals received -&gt; CREATE_COMPLETE
    -   If failure signals or timeout -&gt; CREATE_FAILS
-   CreationPolicy defined on existing resources, simpler (used for EC2 instances and ASG)
-   WaitCondition defined in the condition block (when using external resources or wait states)
    -   It uses a WaitHandle (presigned URL to send signals to)

{{< figure src="./img/cloudformation_creation_policy.png" >}}

{{< figure src="./img/cloudformation_wait_conditions.png" >}}


#### Cfn-Init {#cfn-init}

-   Simple configuration management system
-   Configuration directive are stored in the template
-   AWS::CloudFromation::Init part of the logical resource
-   It is idempotent
-   It is only run at the creating of the instance

{{< figure src="./img/cloudformation_cfn-init.png" >}}


#### Cfn-Hup {#cfn-hup}

-   Daemon detects changes in resource metadata and running configurable actions when a changes is detected
-   Use to run again the configuration when you update the stack

{{< figure src="./img/cloudformation_cfn-hup.png" >}}


### OpsWorks {#opsworks}

Configuration management service to configure and operate applications in a cloud enterprise by using **Puppet or Chef**.

-   **IMPORTANT:** Use mainly when you already have a Puppet or Chef skills or services, or you require to automate

-   Modes:
    -   Puppet Enterprise: AWS managed puppet master server
        -   You specify the desired state of the final service and puppet handles the implementation
    -   Chef Automate: AWS managed chef servers
        -   Similar to IaC based on Ruby configuration, specify a set of steps
    -   OpsWorks Stacks: AWS implementation of Chef where there are no servers to manage
        -   Least admin overhead

{{< figure src="./img/opsworks.png" >}}


### Service Catalog {#service-catalog}

Create, manage, and distribute catalogs of approved products to end-users, who can then access the products they need in a personalized portal.

-   Regional service.
-   Defines approval of provisioning from IT and Customer side.
-   Services defined by CF templates, configure constraints, and manage IAM roles to provide for advanced resource management.
-   Can apply constraints to templates.

{{< figure src="./img/service_catalog.png" >}}


#### Extra {#extra}

-   Uses S3 buckets and DynamoDB databases that are encrypted at rest using Amazon-managed keys.
-   Products are group up into portfolios
-   Admins define the products and the permissions required to launch them


### X-Ray {#x-ray}

Analyzes and debugs production, distributed applications, and microservices architecture.

-   Identify performance bottlenecks, edge case errors, and other hard to detect issues.
-   Can configure the trace sampling rate.

{{< figure src="./img/aws_x-ray.png" >}}


#### Components {#components}

-   Tracing Header: add unique id (trace id) at the creating of the session. Use to track a request though your distributed app
-   Segments: data sent from the supported services to X-RAY. they are data blocks with (host/ip, request, response, work done (time), issues)
-   Subsegments: more granular version of segments, calls to other servies as port of a segments (endpoints, etc)
-   Service Graph: json document detailing services and resources with make up your application
-   Service Map: visual version of the service graph showing traces


#### Data Handling {#data-handling}

For different services there are agents to attach AWS X-Ray.

-   **IMPORTANT:** All of them require IAM permissions.

-   EC2: X-RAY Agents
-   ECS: Agent in tasks
-   Lambda: enable option
-   Beanstalk: agent preinstalled
-   API Gateway: per stage option
-   SNS &amp; SQS


### App Runner {#app-runner}

Deploy web applications and APIs.

-   **IMPORTANT:** Used to deploy container images directly, it manages everything from networking, scaling, load balancing, etc.

-   Build and run secure web applications at scale, without prior container or infrastructure experience.
-   Scale your applications cost effectively on-demand, with high availability and low latency.
-   Connect to database, cache, and message queue services on AWS that support your applications.


### CDK {#cdk}

Open-source software development framework for defining cloud infrastructure in code and provisioning it through CF.

-   **IMPORTANT:** supports faimiliar programming languages so you can use specific characteristics such as for loops.

-   Higher-level abstraction: allows developers to express the infrastructure more naturally and intuitively using their preferred programming languages.
-   Can be integrated with CodePipeline, CodeBuild, and CodeDeploy for CI/CD.


### Proton {#proton}

Managed delivery service for deploying container and serverless applications.

-   Uses templates to define and maintain standard application stacks, which include the architecture, infrastructure resources, and the CI/CD pipeline.


## Application Services {#application-services}


### SNS (Simple Notification Service) {#sns--simple-notification-service}

Set up, operate, and send notifications from the cloud using a pub-sub messaging paradigm.

-   Public, regional, and HA services
-   Coordinates the sending and delivery of messages (&lt;= 256KB payloads)
-   Can use cross-account via topic policy
-   Can be used with SES.

{{< figure src="./img/sns.png" >}}


#### Characteristics {#characteristics}

-   SNS Topic: base entity of SNS where permissions and configurations are defined
-   Publisher: sends messages into a topic
-   Subscribers: messages from topics are deliver to the subscribers
    -   Can be HTTP(s), email (JSON), SQS, mobile push, sms messages &amp; lambda

-   Message filtering: create a filter policy so that it only gets the notifications it is interested in.
-   Message fanout: message is sent to a topic and then replicated and pushed to multiple endpoints.
    -   Provides asynchronous event notifications for parallel processing.
-   SNS mobile notifications: fanout mobile push notifications to multiple devices.


### SQS (Simple Queue Service) {#sqs--simple-queue-service}

Hosted queue that lets you integrate and decouple distributed software systems and components.

-   **IMPORTANT:** Send, receive, or delete messages in batches of up to 10 messages or 256KB.
-   **IMPORTANT:** To deliver a message to multiple SQS queues, prepend a SNS topic and add as subscribers all SQS queues (Fanout)
-   **IMPORTANT:** Data can be encrypted with SSE-SQS (managed SQS keys) or SSE-KMS (managed by KMS).
    -   If KMS keys are used, only customer-managed keys are allowed.
    -   If data is encrypted, services that publish and get information from the queue need permision to access the key.

-   Is a public, fully managed, HA within a region.
-   Encryption at rest (KMS) &amp; in-transit.
-   Queue policy: manage access to queues

-   Polling: how consumers receive messages, it makes a request (billable)
    -   Short polling occurs when the WaitTimeSeconds parameter of a ReceiveMessage request is set to 0.
    -   Long polling helps reduce the cost by eliminating the number of empty responses and false empty responses.
        -   It doesn't return a response until a message arrives in the message queue, or the long poll times out.


#### Types {#types}

-   **IMPORTANT:** Cannot change the type of the queue.

-   Standard Queues (default): makes a best effort to preserve the order of messages.
    -   Consumes messages using short polling (default)
    -   At-least-Once delivery, there can be an occasion that more than one copy of a message

-   FIFO Queues: the order in which messages are sent and received is strictly preserved
    -   **IMPORTANT:** performance is limited to 300 requests per second.
    -   Messages are delivered once and remain available until a consumer processes and deletes it.
    -   Duplicates aren't introduced into the queue.
    -   Support message groups that allow multiple ordered message groups within a single queue.
    -   FIFO queues must have a .fifo suffix to be valid.

{{< figure src="./img/sqs_types.png" >}}


#### Extended Client Library {#extended-client-library}

Handling messages over SQS larger than 256KB storing information in S3.

-   It is a JAVA based application.
-   When a message is deleted, the payload is also deleted from S3.


#### Visibility Timeout {#visibility-timeout}

Messages are hidden (VisibilityTimout) seconds when a receiver gets the message

-   If the receiver processes the message it can delete it from the queue.
-   If nothing appends, the messages reappears (to be reprocessed).

-   Default of 30s, can be between 0s and 12h (set on queue or per-message (with ChangeMessageVisibility))
-   Used for error correction and automatic reprocessing
-   Do not differentiate from different types of messages, it treats them all the same.

{{< figure src="./img/sqs_visibility_timeout.png" >}}


#### Message Timers {#message-timers}

Message timers let you specify an initial invisibility period for a message added to a queue.

-   **IMPORTANT:** Not supported in FIFO queues, they only support Delay Queues.
-   **IMPORTANT:** Used to create Delay Queues, where the message timer influences the whole queue.

-   The default (minimum) invisibility period for a message is 0 seconds. The maximum is 15 minutes.
-   You specify for each message the timer you want (you can delay specific messages based on the type and content).

{{< figure src="./img/sqs_delay_queues.png" >}}


#### Dead-Letter Queues {#dead-letter-queues}

Set aside and isolate messages that can't be processed correctly to determine why their processing didn't succeed.

-   **IMPORTANT:** If maxReceiveCount = 1, any problem loading the message will result in the message being moved to the dead-letter queue. Better to increase it.
-   **IMPORTANT:** Watch out for the timestamp as it is not updated when the messages are moved
    -   Dead-letter queue timestamps are generally longer than the source queue

-   Every time the message is receive, the ReceiveCount value is increased.
-   Allows you to configure an alarm automatically for any errors in the queue and perform specific diagnostics.
-   A single Dead-letter queue can be used for multiple source queues.
-   You define a redrive policy: to specify the source queue, dead-letter count, conditions and defines the maxReceiveCount
    -   When ReceiveCount &gt; maxReceiveCount &amp;&amp; message is not deleted, it's moved to a dead-letter queue

{{< figure src="./img/sqs_dead_letters_queues.png" >}}


#### Pricing {#pricing}

-   Charged per 1 million SQS requests. The price depends on the type of queue being used. Requests include:
    -   API Actions
    -   FIFO Requests
    -   A single request of 1 to 10 messages, up to a maximum total payload of 256 KB
    -   Each 64 KB chunk of a payload is billed as 1 request
    -   Interaction with Amazon S3
    -   Interaction with AWS KMS
-   Data transfer out of SQS per TB/month after consuming 1 GB for that month


### SES {#ses}

Cost-effective and scalable email service that enables you to send mail from within any application.

-   Regional service.


### Step Functions {#step-functions}

Aerverless orchestration for modern applications.

-   **IMPORTANT:** Cannot trigger a Step Function from an S3 event directly.

-   Can create templates (Amazon State Language (ASL) which is a JSON template) to export state machines once they are configured.
-   State machine updates are eventually consistent.
-   IAM Roles are used for permissions


#### Types of States {#types-of-states}

-   Succeed &amp; Fail states
-   Wait states: wait x sec or for a specific event
-   Choice: allows the state machine to take different routes based on the input
-   Parallel: run multiple sets of things at the same time
-   Map: accepts a lists and for each item performs an action
-   Task: single unit of work (lambda, batch, dynamodb, ecs, sns, sqs, glue, sagemaker, emr, step functions)


#### Workflow Types {#workflow-types}

-   Standard (default): for long-running business processes that require durable state storage.
    -   Maximum duration of 1 year
    -   Suited for non-idempotent workflows such as payment processing or starting an EMR cluster
    -   Suitable for complex and fault-tolerant workflows that require coordination across multiple services.

-   Express: for high volume, short-duration (minutes or seconds) workflows
    -   Can run for up to 5 min
    -   No durable state storage, no automatic retries, no error handling, no human approval step.

    -   Asynchronous
        -   Suited for at-least-once workflow execution
        -   Suited for idempotent tasks
    -   Syncrhonous
        -   Suited for tasks for at-most-once workflow


### SWF (Simple Workflow Service) {#swf--simple-workflow-service}

Legacy fully-managed state tracker and task coordinator in the Cloud.

-   **IMPORTANNT:** It uses the AWS Flow Framework (to define workflows only supported by SWF)

-   Not serverless.
-   Used for more complex workflows than Step Functions
-   1 year max runtime

-   Useful when:
    -   Have external signals to intervene in processes
    -   Launch child flows that return to parent
    -   Bespoke / complex decisions
    -   Integration with Mechanical Turk

{{< figure src="./img/swf.png" >}}


### AppSync {#appsync}

Connect apps to data and events with secure, serverless, and performant **GraphQL** and Pub/Sub APIs.

-   Access data from multiple sources with a single request. Instantly create APIs for your databases. Combine APIs into a single Merged API.
-   Create engaging real-time experiences by publishing data from any event source to subscribed clients through serverless WebSockets.
-   Built-in security, monitoring, logging, and tracing. Optional caching for low latency.


### Pinpoint {#pinpoint}

Engage with your customers through SMS, push notifications, in-app messaging, and email.

-   Push notifications: with Firebase Cloud Messaging (FCM), Apple Push Notification Service (APNs), Baidu Cloud Push, and Amazon Device Messaging (ADM).
-   In-app messaging: send targeted messages to users inside your applications.
-   Email: connects with SES.


### MQ {#mq}

Managed open source message broker based on Apache ActiveMQ. It also support RabbitMQ.

-   **IMPORTANT:** Not a public service, runs on a VPC. Private networking required.

-   Support JMS API, or protocols like AMQP, MQTT, OpenWire, and STOMP.
    -   Used to migrate from an existing system with little to no application change
-   Provides queues and topics (supports one-to-one and one-to-many messaging architectures)
-   Uses EFS for storage by default.

{{< figure src="./img/amazon_mq.png" >}}


### Mechanical Turk {#mechanical-turk}

Managed human task outsourcing API to extend your app with humans

-   Requesters post Human Intelligence Tasks (HITs), where workers earn by completing HITs.
-   Pay per task for tasks better suited to humans rather than ML.
-   You can set qualifications (worker attributes) which can require a test to complete HITs.


### Elemental MediaLive {#elemental-medialive}

Encode live video for broadcast and streaming to any device

-   **IMPORTANT:** Suitable to stream a live video to many users.

-   Produce broadcast-quality live streams with support for advanced video and audio capabilities.
-   Automate provisioning of video encoding infrastructure, letting you deploy a live channel in minutes.
-   Manage resources across multiple Availability Zones, and detect and resolve issues without disrupting live channels.
-   Avoid upfront investment in encoding infrastructure, only paying for the service as you use it.


### MC (Elemental MediaConvert) {#mc--elemental-mediaconvert}

File-based serverless video transcoding services and media processing.

-   Replacement of Elastic Transcoder.
-   Add jobs to pipelines for ET or queues for MC.
-   Designed for larger volume &amp; parallel processing.

-   Elastic Transcoder should only be used for:
    -   WebM (VP8/VP9 formats)
    -   animated GIF
    -   MP3, FLAC, Vorbis and WAV

{{< figure src="./img/mediaconvert.png" >}}


### IoT {#iot}

Managed cloud service that connects IoT devices to other devices and AWS cloud services easily.

-   IoT Gateway is a HA and resilient service which functions as the endpoint for all of the iot devices.
-   Protocols that are supported: MQTT, MQTT over WSS, HTTPS, LoRaWAN.
-   Device messages are in encrypted JSON with X509 certs and messages uses MQTT topics
-   Device shadows: virtual representations of the actual devices which is a copy of the config of the real device.
    -   It can be written to it and read, and when the physical device is connected, they are synced.
    -   Used as IoT device links are unreliable and communication channels are not always kept on.

{{< figure src="./img/iot.png" >}}

{{< figure src="./img/iot_services.png" >}}


#### IOT Device Management {#iot-device-management}

Register, organize, monitor, and remotely manage connected devices at scale.

-   Swiftly onboard and organize your devices into flexible hierarchies to streamline fleet maintenance and workflow updates.
-   Save time by filtering your device search based on specific attributes to make informed decisions.
-   Securely and remotely monitor your device fleet health status, analyze trends, troubleshoot, and push updates at scale.
-   Visualize your fleet’s health status and remotely perform real-time actions, such as firmware updates and device reboots, using Fleet Hub.


#### IOT Device Defender {#iot-device-defender}

Fully managed IoT security service to secure your IoT configurations on an ongoing basis.

-   Audit the security posture of IoT resources across your device fleet to easily identify gaps and vulnerabilities.
-   Use machine learning (ML) models or define your own device behaviors to monitor traffic from a malicious IP or a spike in connection attempts.
-   Get security alerts when an audit fails or behavior anomalies are detected. Quickly take actions to minimize operational risk.
-   Easily mitigate security issues through built-in actions such as updating a device certificate, quarantining a group of devices, or replacing default policies.


#### IOT Device SDK {#iot-device-sdk}

Easily and quickly connect your hardware device or mobile application to AWS IoT Core.

-   Helps connect, authenticate, and exchange messages with AWS IoT Core using the MQTT, HTTP, or WebSockets protocols.


#### IOT 1-Click {#iot-1-click}

Launch lambda functions from the ready-to-use simple IoT device.

-   You can also managa this devices from mobile apps or from the console.


#### IOT Sitewise {#iot-sitewise}

Collect, organize, and analyze data from industrial equipment at scale

-   **IMPORTANT:** Plugin for Grafana to visualize near real-time equipment data.


#### FleetWise {#fleetwise}

Efficiently collect vehicle data and organize it in the cloud so you can use the data to improve vehicle quality, performance, and autonomy.


#### Greengrass {#greengrass}

Move the AWS services to the edge. Run Lambda function, S3 buckets on your IoT devices.

-   Services such as (compute, messaging, data management, sync and ML) can be moved to the edge devices
-   Locally run Lambda or containers.

{{< figure src="./img/greengrass.png" >}}


### AppFlow {#appflow}

Integration service that automates data flows by securely integrating third-party applications and AWS services without writing any code.

-   Run flows on-demand or on a schedule to keep data in sync across SaaS applications and AWS services
-   Aggregate data from multiple sources to train analytics tools more effectively and save money.


### Device Farm {#device-farm}

Test and interact with your Android, iOS, and web apps on real, physical devices

-   Use built in or supported automated testing frameworks.
-   Receive reports detailing testing output.
-   Supports remote connection to devices for issue reproduction and testing.

{{< figure src="./img/device_farm.png" >}}


### Amplify {#amplify}

Build full-stack web and mobile apps in hours. Easy to start, easy to scale.

-   Amplify Hosting: fully managed CI/CD and hosting service for single-page applications (SPA), using AWS S3 and AWS CloudFront to deliver content to users around the world.
-   Amplify Studio: visual development environment for building serverless web applications.


## Data Protection {#data-protection}


### Backup {#backup}

Fully managed service to centralize and automate data protection across AWS services and hybrid workloads and regions.

-   **IMPORTANT:** Use Organizations backup policies to create backup plans across multiple accounts.
    -   Cannot edit or delete backups from individual accounts. Enforce backup policies across the org.

-   Saved in fully AWS managed s3 buckets
-   Resources: EC2, EBS, RDS, DynamoDB, Neptune, DocumentDB, EFS, FSx, Storage Gateway vols, S3, VMware
-   Features: policy based backup, centralized, automated scheduling, automated retention management, lifecycle management policies, incremental backups, cross-region backup, monitoring, secure data, compliance


#### Backup Plan {#backup-plan}

Policy expression that determines when and how back up AWS resources.

-   Stores periodic backups incrementally.
-   Can be assigned to a resource (individual) or a resource type (every instance or resource)
-   To delete a backup plan, first delete all resources associated with it.
-   When retention period is changed, the retention period previous backups remains unchanged.


#### Backup Vault {#backup-vault}

Container to store and organize backups.

-   **IMPORTANT:** Backup Vault Lock allows to enforce retention periods and prevent early deletions.

-   Create multiple backup vaults if you need different encryption keys or access policies for different groups of backups.
-   Backups in vaults are encrypted via KMS encryption keys.
-   Backup default backup vault and EFS automatic backup vault cannot be deleted.


#### Backup or Recovery Point {#backup-or-recovery-point}

Content of a resource at a specific time stored in backup valuts.

-   Created automatically (with backup plans) or manually.
-   Backup copies can be created across regions and accounts.
-   Lifecycle policies and tags can be added.


#### Backup Audit Manager {#backup-audit-manager}

<!--list-separator-->

-  Audit Frameworks

    set of controls that allows you to assess your backup practices.

    -   Find backup activity and resources that aren’t yet in compliance with the controls.
    -   Each framework applies to a single account and a maximum of 10 per AWS Region.
    -   Types: AWS Backup framework, custom framework

<!--list-separator-->

-  Audit Reports

    Automatically generate an audit trail of daily and on-demand reports.

    -   **IMPORTANT:** Reports can only be in the same region and account as the S3 bucket.

    -   Create a report plan from a report template to create daily or on-demand reports.
    -   Types of report templates: backup report templates or compliance report templates
    -   Each AWS account can only have a maximum of 20 report plans.


#### Monitoring {#monitoring}

Manage and monitor backup, restore, and copy jobs across an org and multiple accounts.

-   EventBridge to view and monitor AWS Backup events.
-   CloudWatch to track metrics, create alarms, and view dashboards.
-   CloudTrail to monitor AWS Backup API calls.
-   SNS to subscribe and notify you of AWS Backup events.


#### Pricing {#pricing}

Charged for:

-   Amount of backup storage.
-   Amount of backup data that has been transferred between regions.
-   Amount of backup data restored.
-   Number of backup evaluations.


### DLM (Data Lifecycle Manager) {#dlm--data-lifecycle-manager}

Automate lifecycle management of EBS Snapshots and EBS-backed AMIs

-   **IMPORTANT**: EBS direct API can be used to copy the snapshots directly to S3.
-   **IMPORTANT:** Cannot be used with Organizations backup policies.

-   Create policies to define your backup creation and retention requirements.


### Snapshots {#snapshots}

-   Stored in a protected part of Amazon S3
-   Incremental copies
-   Can be perform on EBS volumes and FSx for lustre


### Cloudendure Disaster Recovery {#cloudendure-disaster-recovery}

Cost-effective disaster recovery option for your on-premises servers and applications.

-   Continuously replicates machines into a low-cost staging area in your target AWS account and preferred Region.
-   Uses EBS volumes to store the data


### Elastic Disaster Recovery {#elastic-disaster-recovery}

Scalable, cost-effective application recovery to AWS

-   Recovery within minutes, at their most up-to-date state or from a previous point in time.
-   Use a unified process to test, recover, and fail back a wide range of applications, without specialized skillsets.
-   Automate actions such as configuring your environment, cleaning up drill resources or activating monitoring tools on launched instances.

-   Use cases:
    -   On-premises to AWS
    -   Cloud to AWS
    -   AWS Region to AWS Region


## Machine Learning &amp; AI {#machine-learning-and-ai}


### A2I (Augmented Ai) {#a2i--augmented-ai}

Service to easily integrate human reviews in a ML workflow.

-   Simplifies managing a large number of human reviewers at scale.
-   Direct integration with Textract and Rekognition.


### Lex {#lex}

Backend services to provide text or voice conversational interface with pay as you go pricing.

-   Speech to text with Automatic speech recognition (ASR)
-   Intent recognition with Natural Language Understanding (NLU)
-   Uses deep learning to improve over time.
-   Used for chatbots, voice assistants, q&amp;a bots, info/enterprise bots.


### Comprehend {#comprehend}

Managed NLP service used to extract meaningful information from unstructured texts so you can analyze them in a human-like context.

-   You input a document (text) and the output are entities, phrases, language, PII, sentiments, etc.
-   Can use pre-trained or custom models.
-   Also offer medical insights with Comprenhend Medical.
-   Confidence score is between 0 and 100, indicating the probability that a given prediction is correct.


### Kendra {#kendra}

Highly scalable, intelligent enterprise search service.

-   Supports wide range of question types: factoid (who, what, where), descriptive, keyword (need to determine the intent)
-   Uses NLP to get highly accurate answers without the need for machine learning (ML) expertise.
-   Can fine-tune search results based on content attributes, freshness, user behavior, and more.
-   Delivers ML-powered instant answers, FAQs, and document ranking as a fully managed service.


#### Components {#components}

-   Index: searchable data organized in a efficient way
-   Data source: where your data lives, and kendra indexes from this location. Can be S3, Confluence, Google Workspace, RDS, OneDrive, Salesforce, Kendra Web Crawler, Workdocs, FSX, etc.
    -   It is synchronize with index based on a schedule
-   Documents: structured (faqs), unstructured (html, pdf, etc)


### Poly {#poly}

Converts text into "life-like" speech

-   Takes text (language) -&gt; speech (in the same language) no translation
-   Output formats: mp3, ogg vorbis, pcm, etc.
-   Capable of using speech synthesis markup language (SSML) to have additional control over how Polly generates speech (emphasis, pronunciation, whispering, speaking style)

-   Standard TTS = concatenative (uses phonemes to build patterns of speech)
-   Neural TTS = phonemes -&gt; spectograms -&gt; vocoder -&gt; audio (complex using AI, more human-natural speech)


### Bedrock {#bedrock}

Fully managed service that allows you to build and scale generative AI applications.

-   It is serverless.


### Elastic Inference {#elastic-inference}

Allows attaching low-cost GPU-powered inference acceleration to EC2 instances, SageMaker instances, or ECS tasks.

-   Reduce machine learning inference costs by up to 75%.


### Rekognition {#rekognition}

Deep learning based image and video analysis

-   **IMPORTANT:** Can analyze live video streams with Kinesis Video Streams.

-   Identify objects, people, text, activities, content, moderation, face detection, face analysis, face comparison, pathing, etc.
-   Per image or per minute (video) pricing
-   Integrates with applications &amp; event-driven


### Sagemaker {#sagemaker}

Fully managed service that allows data scientists and developers to easily build, train, and deploy machine learning models at scale.

-   Can do fetch, clean, prepare, train evaluate, deploy, monitor/collect.
-   Sagemaker has not cost but the resources that it uses do (complex pricing)

-   Sagemaker studio: IDE for ML lifecycle -&gt; build, train, debug and monitor models
-   Sagemaker domain: isolation of environments with EFS colume, users, apps, policies, vpcs, etc.
-   Containers: docker containers deployed to ml ec2 instance (with ml environments)
-   Hosting: deploy endpoints for your models (serverless or always on running)


### Textract {#textract}

Document analysis service for detecting and extracting information from scanned documents.

-   Analysis: relationship between text and metadata
-   Small documents the text extraction is performed in a synchronous (real-time)
-   Large documents (big pdfs) are done asynchronous

-   Input: jpeg, png, pdf, or tiff
-   Output: extracted text, structure and analysis


### Transcribe {#transcribe}

-   Automatic Speed Recognition (ASR) service

-   Input audio -&gt; output text
-   Supports language customization, filters for privacy, audience-appropriate language, speaker identification
-   Also supports custom vocabularies and language models.


### Translate {#translate}

Fluent translation with higher accuracy than traditional statistical and rule-based translation models

-   Translates text from native language to other languages (one word at a time).
-   Source language can be auto detected

-   Encoder reads source to create a semantic representation (meaning)
-   Decoder reads the meaning to write to the target language

-   Attention mechanisms ensure the 'meaning' is translated


### Forecast {#forecast}

Forecasting for time-series data

-   Used for retail demand, supply chain, staffing, energy, server capacity, web traffic, etc.
-   Import historical &amp; related data to understand what is normal
-   Output a forecast and forecast explainability (reasons for changes)


### Fraud Detector {#fraud-detector}

Fully managed fraud detection service

-   It works by scoring events (by rules or decison logic) and allows you to react to the scored based on the business activity
-   Used to detect new account detection, payments, guest checkout
-   At first you upload historical data and choose a model type
-   Model types:
    -   Online Fraud: used with little historical data such as new customer accounts
    -   Transaction Fraud: transactional history and identify suspect payments
    -   Account Takeover: identify phishing or another social based attack


### Personalize {#personalize}

Fully managed machine learning service for building recommendation systems.


## Other {#other}


### Connect {#connect}

Contact center as a service, accept incoming and outgoing calls with no infrastructure

-   Omnichannel: voice and chat, incoming &amp; outgoing
-   Integrates wtih PSTN networks for traditional voice
-   Agents can connect using the internet from anywhere
-   Integrates with other AWS services (Lambda/LEX) for additional intelligence and features
-   Quick to privision, pay as you use pricing &amp; scalable


### Workspaces {#workspaces}

Desktop-As-A-Service (DAAS), home-working/office

-   Uses directory service (simple, AD, AD Connector) for authentication and user management.
-   Workspaces uses and ENI in a VPC (uses VPC networking)
-   In Windows, they can access FSx and EC2 windows resources, or on-premise over VPN or Direct Connect
-   At-rest encryption (EBS + KMS)
-   AWS Workspaces by default are susceptible to AZ failures but there is recovery and can multiple AZ ca be used.

{{< figure src="./img/aws_workspaces.png" >}}


### AppStream 2.0 {#appstream-2-dot-0}

Secure, reliable, and scalable application streaming and low-cost virtual desktop service

-   **IMPORTANT:** Monthly fee per streaming user and stream resource required for provisioning.

-   Empower remote workers and react quickly to changing conditions with secure access to applications and desktops from anywhere.
-   Stream Software-as-a-Service (SaaS) applications or quickly convert desktop applications to SaaS without refactoring.
-   Select from a range of compute, memory, and storage options, while auto scaling helps avoid overprovisioning.
-   Reduce downtime with fully managed application streaming and virtual desktop services, including a financially-backed 99.9% uptime SLA.

-   Use cases:
    -   Convert apps to SaaS
    -   Streaming apps
    -   Learning environments
    -   3D and engineering


## Methodologies &amp; AWS Concepts {#methodologies-and-aws-concepts}


### CAF (Cloud Adoption Framework) {#caf--cloud-adoption-framework}

Framework provided by AWS to assist you in adopting cloud computing for your enterprise infrastructure.


#### Capabilities {#capabilities}

-   Business: investments in the cloud propel your digital transformation goals and business results.
-   People: link between technology and business to help organizations quickly evolve into a culture of continuous growth and learning.
    It focuses on culture, organizational structure, leadership, and workforce.
-   Governance: coordinate cloud initiatives while maximizing organizational benefits and minimizing risks associated with transformation.
-   Platform: construct an enterprise-grade, scalable, hybrid cloud platform, modernize existing workloads, and implement new cloud-native solutions.
-   Security: confidentiality, integrity, and availability of data and cloud workloads.
-   Operations: deliver cloud services at a level that meets the business needs.


#### Benefits {#benefits}

-   Risk Reduction: through improved reliability, increased performance, and enhanced security.
-   Improve environmental, social, and governance performance: use insights to improve sustainability and corporate transparency.
-   Revenue Growth: create new products and services, reach new customers, and enter new market segments.
-   Increased Operational Efficiency: reduce operating costs, increases productivity, and improves the employee and customer experience.


#### Phases {#phases}

1.  Envision: identifying and prioritizing transformation opportunities (with measurable outcomes) that align with strategic objectives.
2.  Align: capability gaps and cross-organizational dependencies are identified.
    -   Helps to create strategies for improving cloud readiness, ensuring stakeholder alignment, and facilitating relevant organizational change management activities.
3.  Launch: delivering pilots in production and demonstrating incremental business value.
    -   Pilots should be highly impactful, and when successful, they influence future direction.
    -   Learning from pilots helps businesses adjust their approach before scaling to full production.
4.  Scale: pilots and business value are expanded to the desired scale. Business benefits associated with cloud investments are realized and sustained.


### Design Priciples {#design-priciples}


#### Scalability {#scalability}

-   Horizontally: an increase in the number of resources
-   Vertically: an increase in the specifications of an individual resource


#### Disposable Resources {#disposable-resources}

-   Instantiating compute resources: automate setting up of new resources along with their configuration and code.
-   Infrastructure as Code: make the whole infrastructure reusable, maintainable, extensible, and testable.


#### Automation {#automation}

-   Serverless management and deployment: focus on automation of code deployment, AWS handles the management tasks.
-   Infrastructure management and deployment: AWS handles resource provisioning, load balancing, auto scaling, and monitoring.
-   Alarms and events: AWS services will continuously monitor your resources and initiate events when certain metrics or conditions are met.


#### Loose Coupling {#loose-coupling}

-   Well-defined interfaces: reduce interdependencies by allowing various components to interact with each other through agnostic interfaces (RESTful APIs).
-   Service discovery: services should be able to be consumed without prior knowledge of their network topology details.
-   Asynchronous integration: interacting components that do not need an immediate response.
-   Distributed systems best practices: handle component failure in a graceful manner.


#### Services, Not Servers {#services-not-servers}

-   Managed services: focus on building services for other applications.
-   Serverless Architectures: reduce the operational complexity of running applications with event-driven and synchronous services.


#### Databases {#databases}

-   Relational databases: powerful query language, flexible indexing, strong integrity controls, and the ability to combine data from multiple tables in a fast and efficient manner.
-   NoSQL Databases: more flexible data model with horizontal scalability, but less query and transaction capabilities. Data models, including graphs, key-value pairs, and JSON documents.
-   Data warehouses: specialized type of relational database, optimized for analysis and reporting of large amounts of data.
-   Graph Databases uses graph structures for queries.


#### Managing Increasing Volumes Of Data {#managing-increasing-volumes-of-data}

-   Data Lake: an architectural approach to store massive amounts of data in a central location.
    -   Readily available to be categorized, processed, analyzed, and consumed by diverse groups within your organization.


#### Removing Single Points Of Failure {#removing-single-points-of-failure}

-   Detect failure: use health checks and collect logs.
-   Distributed resilience on different physical zones.

<!--list-separator-->

-  REDUNDANCY

    -   Standby redundancy: when a resource fails, functionality is recovered on a secondary resource with the failover process.
        -   The failover usually requires some time before it completes, and during this period the resource remains unavailable.
        -   Often used for stateful components such as relational databases.
    -   Active redundancy: requests are distributed to multiple redundant compute resources.
        -   When one of them fails, the rest can simply absorb a larger share of the workload.

<!--list-separator-->

-  DURABLE DATA STORAGE

    -   Synchronous replication: only acknowledges a transaction after it has been durably stored in both the primary storage and its replicas.
        -   Ideal for protecting the integrity of data from the event of a failure of the primary node.
    -   Asynchronous replication: decouples the primary node from its replicas at the expense of introducing replication lag.
        -   Changes on the primary node are not immediately reflected on its replicas.
    -   Quorum-based replication: combines synchronous and asynchronous replication by defining a minimum number of nodes that must participate in a successful write operation.


#### Optimize For Cost {#optimize-for-cost}

-   Right sizing: use the correct size of the service for each application.
-   Elasticity: rapid scaling during high-traffic events.
-   Purchasing options: reserved instances vs spot instances.


#### Caching {#caching}

-   Application data caching: store and retrieve information from fast, managed in-memory caches.
-   Edge caching: serves content by infrastructure that is closer to viewers, which lowers latency and gives high, sustained data transfer rates.


#### Security {#security}

-   Defense in depth: secure multiple levels from network down to application and database.
-   Share security responsibility with AWS
-   Reduce privileged access: implement Least Privilege Principle.
-   Security as code: system and infrastructure hardening in templates that defines a Golden Environment.
-   Real-time auditing: continuous monitoring and automation of controls on AWS to minimize exposure to security risks.


### Disaster Recovery And Business Continuity {#disaster-recovery-and-business-continuity}


#### Types Of DR {#types-of-dr}

Effective DR / BC costs money all of the time

-   RTO (Return Time Objective): time it takes after a disruption to restore.
-   RPO (Return Point Objective): amount of data loss measured in time it is acceptable to loose.

<!--list-separator-->

-  Backup &amp; Restore (Active / Passive)

    Back up data at the primary site to the secondary site.

    -   AWS Backup can be used

    {{< figure src="./img/disaster_recovery_types_backup_&_restore.png" >}}

<!--list-separator-->

-  Pilot Light (Active / Passive)

    Preconfigure a separate environment with the core infrastructure installed (not running) and replicate the data.

    -   Often used when plan for disasters is required but really likely to occur.
    -   Elastic Disaster Recovery
    -   CloudFront offers origin failover (failover is done per each request).
    -   Global Accelerator can be used to avoid caching issues with DNS (integrated health checks to monitor endpoints).

    -   BEST PRACTICE: use different account per region (in case of compromised credentials)

    {{< figure src="./img/disaster_recovery_types_pilot_light.png" >}}

<!--list-separator-->

-  Warm Standby (Active / Passive)

    -   Small version replication of the primary site into the fully functional secondary.
    -   When a disaster occurs, just scale up the instances to cope with the new load.

    {{< figure src="./img/disaster_recovery_types_warm_standby.png" >}}

<!--list-separator-->

-  Multi Site (Active / Active)

    -   Multiple sites with the same infrastructure running
    -   No recovery time as it load balances across both environments (HA and performance benefits)

    {{< figure src="./img/disaster_recovery_types_active_active.png" >}}


#### Services {#services}

<!--list-separator-->

-  Storage

    -   EBS replicates within a AZ
        -   Failure to the AZ means failure of a volume -&gt; create volume snapshots in S3
    -   S3 replicated across 3+ AZs in a region (except for OneAZ classes).
    -   EFS systems are replicated across multiple AZs.

    -   For global resilience, copy S3 bucket snapshots to another region

    {{< figure src="./img/disaster_recovery_storage.png" >}}

<!--list-separator-->

-  Compute

    -   For EC2, use ASG on different AZs to provide regional resilience
    -   ECS cluster run in EC2 mode, same as EC2
    -   ECS in fargate mode can achieve similar characteristics as the ASG
    -   Lambdas are regionally resilient by default

    {{< figure src="./img/disaster_recovery_compute.png" >}}

<!--list-separator-->

-  Database

    -   Database in EC2 have no resilience beyond snapshots.
    -   DynamoDB is regionally resilient and even global if global tables is enabled.

    -   (No Aurora) RDS replication occurs between primary and standby instances. Storage is dependent on the instance
    -   (No Aurora) RDS you can create Cross Region Read Replicas (asynchronous replication).
    -   Aurora can have replicas in different AZs and the storage uses a cluster storage architecture (replicated across 3 AZs 6+ times) stronger than no aurora rds (regionally resilience)
    -   Aurora global databases (secondary read only clusters can be promoted to primary) to make it globally resilient (take care writes only allowed in the primary region)

<!--list-separator-->

-  Networking

    -   VPC are regionally resilient (VPC router and IGW also).
    -   By using ELB make subnets regionally resilient
    -   Interface endpoint are AZ dependent


### Global Infrastructure {#global-infrastructure}

-   Availability Zone consists of one or more data centers within 100 kilometers.
-   Region consists of multiple Availability Zones.
    -   Every region has different compliance, latency, pricing, and service availability.

-   **IMPORTANT:** AWS rotates which physical facilities are used for AZs. One accounts A AZ can be other's B.
    -   AZ IDs are the same for all accounts, example az1 or az2.

-   Edge Networks consists of edge locations and regional edge caches.

-   Local Zones are data centers in specific cities used for super low latency applications.

    -   Can be connected to VPCs creating subnets in them.
    -   Can be connected with direct connect to on-premises resources.
    -   Private networking with the parent region and use regional services such as S3 or EBS snapshots.

    {{< figure src="./img/aws_local_zones.png" >}}


### Well-Architected Framework Pillars {#well-architected-framework-pillars}


#### Operational Excellence {#operational-excellence}

Ability to run and monitor systems to deliver business value and to continually improve supporting processes and procedures.

Best practice areas and tools:

-   Organization: AWS Cloud Compliance, AWS Trusted Advisor, AWS Organizations
-   Prepare: AWS Config
-   Operate: Amazon CloudWatch
-   Evolve: Amazon Elasticsearch Service


#### Security {#security}

Ability to protect information, systems, and assets while delivering business value through risk assessments and mitigation strategies.

Best practice areas and tools:

-   Security: AWS Shared Responsibility Model, AWS Config, AWS Trusted Advisor
-   Identity and access management: IAM, Multi-Factor Authentication, AWS Organizations
-   Detective controls: AWS CloudTrail, AWS Config, Amazon GuardDuty
-   Infrastructure protection: Amazon VPC, Amazon CloudFront with AWS Shield, AWS WAF
-   Data protection: ELB, Amazon Elastic Block Store (Amazon EBS), Amazon S3, and Amazon Relational Database Service (Amazon RDS) encryption, Amazon Macie, AWS Key Management Service (AWS KMS)
-   Incident response: IAM, Amazon CloudWatch Events


#### Reliability {#reliability}

Ability of a system to recover from infrastructure or service disruptions, dynamically acquire computing resources to meet demand, and mitigate disruptions such as misconfigurations or transient network issues.

Best practice areas and tools:

-   Foundations: IAM, Amazon VPC, AWS Trusted Advisor, AWS Shield
-   Change Management: AWS CloudTrail, AWS Config, Auto Scaling, Amazon CloudWatch
-   Failure Management: AWS CloudFormation, Amazon S3, AWS KMS, Amazon Glacier
-   Workload Architecture:  AWS SDK, AWS Lambda


#### Performance Efficiency {#performance-efficiency}

Ability to use computing resources efficiently to meet system requirements, and to maintain that efficiency as demand changes and technologies evolve.

Best practice areas and tools:

-   Selection: Auto Scaling for Compute, Amazon EBS and S3 for Storage, Amazon RDS and DynamoDB for Database, Route53, VPC, and AWS Direct Connect for Network
-   Review: AWS Blog and What’s New section of the website
-   Monitoring: Amazon CloudWatch
-   Trade-offs: Amazon Elasticache, Amazon CloudFront, AWS Snowball, Amazon RDS read replicas.


#### Cost Optimization {#cost-optimization}

Ability to avoid or eliminate unneeded cost or sub optimal resources.

Best practice areas and tools:

-   Cloud financial management: Amazon QuickSight, AWS Cost and Usage Report (CUR)
-   Cost-effective resources: Cost Explorer, Amazon CloudWatch and Trusted Advisor, Amazon Aurora for RDS, AWS Direct Connect with Amazon CloudFront
-   Matching supply and demand: Auto Scaling
-   Expenditure awareness: AWS Cost Explorer, AWS Budgets
-   Optimizing over time: AWS News Blog and the What’s New section on the AWS website, AWS Trusted Advisor


#### Sustainability {#sustainability}

Ability to increase efficiency across all components of a workload by maximizing the benefits from the provisioned resources.

Best practice areas and tools:

-   Region selection: AWS Global Infrastructure
-   User behavior patterns: Auto Scaling, Elastic Load Balancing
-   Software and architecture patterns: AWS Design Principles
-   Data patterns: Amazon EBS,  Amazon EFS, Amazon FSx, Amazon S3
-   Hardware patterns: Amazon EC2, AWS Elastic Beanstalk
-   Development and deployment process: AWS CloudFormation


### Service Quotas {#service-quotas}

Limit on the resources that an AWS account can use.

-   They can be extended though the Console or AWS Support.
-   Check "Service Quotas" in AWS Console (here is where you can change it)
    -   Can also create a CloudWatch Alarm for any quota.

-   [Service endpoints and quotas](https://docs.aws.amazon.com/general/latest/gr/aws-service-information.html)


## Comparison of Services {#comparison-of-services}


### Migrations {#migrations}


#### DataSync vs Snowball/Snowball Edge {#datasync-vs-snowball-snowball-edge}

-   DataSync for online data transfers.
-   Snowball/Snowball Edge for offline data transfers, for customers who are bandwidth constrained, or transferring data from remote or disconnected environments.


#### DataSync vS AWS Storage Gateway File Gateway {#datasync-vs-aws-storage-gateway-file-gateway}

-DataSync to migrate existing data to Amazon S3
-File Gateway to retain access to the migrated data and for ongoing updates from your on-premises file-based applications.


#### DataSync vs Amazon S3 Transfer Acceleration {#datasync-vs-amazon-s3-transfer-acceleration}

-S3 if your applications are already integrated with it, and you want higher throughput for transferring large files to S3, with S3TA
-DataSync if not.


#### DataSync vs AWS Transfer for SFTP {#datasync-vs-aws-transfer-for-sftp}

-   Transfer Family if you currently use SFTP to exchange data with third parties.
-   DataSync if you want an accelerated and automated data transfer between NFS servers, SMB file shares, Amazon S3, Amazon EFS, and Amazon FSx.


### Comparing Instance Store &amp; EBS {#comparing-instance-store-and-ebs}

-   Persistence, Resilience, isolated from instance lifecycle -&gt; EBS
-   Super high performance, cost -&gt; Instance Store

-   Cheap -&gt; ST1 or SC1
-   Throughput streaming -&gt; ST1
-   Boot -&gt; NOT ST1 or SC1
-   16k IOPS -&gt; GP2/3
-   64k IOPS -&gt; IO1/2
-   256k IOPS -&gt; IO2 Block Express
-   260k IOPS -&gt; RAID0 + EBS (io1/2-BE/GP2/3)
-   More with temporary -&gt; Instance Store


### Difference Between NAT Instance &amp; NAT Gateway When Handling Timeout: {#difference-between-nat-instance-and-nat-gateway-when-handling-timeout}

NAT Instance - When there is a connection time out, a NAT instance sends a FIN packet to resources behind the NAT instance to close the connection.
NAT Gateway - When there is a connection time out, a NAT gateway returns an RST packet to any resources behind the NAT gateway that attempt to continue the connection (it does not send a FIN packet)


## Interesting Points {#interesting-points}


### SSL Offloading {#ssl-offloading}

-   Use ACM to have a SSL cert and attach it to the ALB.
-   Use HTTP for the connection between the ALB and the EC2 instances.
-   That way it is easier and you don't have to provide a cert for every EC2 instance.


### Static IPS {#static-ips}

-   Use GlobalAcceleartor for multiple regions.
-   Use NLB in front of ALB for on region (cheapest).


### DDoS Mitigation Without AWS Shields {#ddos-mitigation-without-aws-shields}

-   Use CloudFront to distribute static resources and route dynamic resources to an Auto Scaling Group.
-   Use WAF with the ALB to route traffic to the ASG and protect it from common web exploits.
-   Use an ASG to scale for massive incoming of data.
-   Use CW alerts to scale the ASG and send alerts with "CPUUtilization" and "NetworkIn" metrics.
