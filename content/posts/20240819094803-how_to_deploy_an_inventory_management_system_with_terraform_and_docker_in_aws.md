+++
title = "How to deploy an inventory management system with Terraform and Docker in AWS"
author = ["Andrés Navarro Pedregal"]
date = 2024-05-20T00:00:00+02:00
tags = ["cloud"]
draft = false
+++

In this post, I will show how to set up [Snipe-IT](https://snipeitapp.com/), an open-source asset management, to create your self-hosted inventory. And the best part is that you do not have to manage it!

The motivation for this project was to get an inventory up and running in AWS with a focus on minimal maintenance and cost.


## Architecture {#architecture}


### Software {#software}

For the setup, I will be installing Snipe-IT with [Docker containers](https://www.docker.com/).

As Snipe-IT needs a MySQL database, I will use a MySQL container. I did not use the RDS database as it was expensive for my use case.

And to get an automatically signed SSL certificate, I will be using a custom Nginx container. Check it out [here](https://github.com/Valian/docker-nginx-auto-ssl).

Finally, to connect and deploy the containers together, I will be using [Docker Compose](https://docs.docker.com/compose/). Check out the complete [docker-compose.yml](https://github.com/andres-nav/snipe-it/blob/main/src/docker-compose.yml) file.


### Deployment {#deployment}

To standardize the deployment, I will be using [Terraform](https://www.terraform.io/), a great tool to manage cloud resources. However, Terraform is [not open-source anymore](https://www.hashicorp.com/license-faq). Check out [OpenTofu](https://opentofu.org/) if you want an open-source fork!

The cloud provider that I will be using will be AWS, as it is the one I know more about. Check out [my post]({{< relref "20240819094016-how_i_passed_the_aws_solutions_architect_professional_with_no_experience.md" >}})!

Regarding the deployment of docker containers and automatic redeployment in case any errors occur, I will use an auto-scaling group. That is because I want to make sure it is always up and running from the latest backup.

Finally, to ensure we don't lose the data in the MySQL container, I will save the backups in an S3 bucket every night. All resources are managed and created by the Terraform deployment, so there is no need to worry about ;)


## Installation {#installation}

The installation steps can be found in [my repository](https://github.com/andres-nav/snipe-it/tree/main). Please follow them step by step and adapt them to your needs.

If you have any questions, feel free to [open an issue](https://github.com/andres-nav/snipe-it/issues).


## Considerations {#considerations}

-   Edit the public key in the terraform deployment. Otherwise, I will be able to access your instance ...
-   Make sure to change the database passwords so they are strong.
-   Treat your `.env` and `*.tfvars` files as secrets, they are!


## Conclusions {#conclusions}

All in all, I hope this project helps you to set up an inventory faster and more reliably.

PS: Check out the [code](https://github.com/andres-nav/snipe-it) and make sure to [open an issue](https://github.com/andres-nav/snipe-it/issues) if you have any suggestions!
