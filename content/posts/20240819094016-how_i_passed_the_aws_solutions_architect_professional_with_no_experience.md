+++
title = "How I passed the AWS Solutions Architect Professional with no experience"
author = ["Andrés Navarro"]
date = 2024-02-28T00:00:00+01:00
tags = ["cloud"]
draft = false
+++

First of all, this exam has been one of the hardest I have taken, but that does not mean it is impossible.

Preparing for it took me **3 months, for 4 hours each day** doing exams, research, hands-on learning, and projects.

It has taught me how to design and architecture of robust, secure, and scalable infrastructure.

You can find my **notes** with **helpful tips** at the end of this post. I hope you find them useful!

{{< figure src="/ox-hugo/aws_sap_exam_results.png" >}}


## Why did I take the AWS SAP-C02? {#why-did-i-take-the-aws-sap-c02}

A few months ago, I attended a conference on "A life as a Solutions Architect in AWS" hosted by [Duarte Moura](https://www.linkedin.com/in/duarte-moura/) and [Jorge Hernández](https://www.linkedin.com/in/jorge-hern%C3%A1ndez-su%C3%A1rez-9a38011b8/).

During the event, I was introduced to the role of a Solutions Architect, which I found fascinating.

The more I looked into the role, the more I liked it; as I have always enjoyed creating solutions and solving challenging problems with technology.

For that, I decided to push myself and obtain the [AWS Certified Solutions Architect Professional](https://aws.amazon.com/certification/certified-solutions-architect-professional/).


## My starting point, for context {#my-starting-point-for-context}

While it is true that I **had minimal experience with AWS**, having only deployed some EC2 instances, my background in computers was extensive.

Since 12, I've been immersed in computer science, developing and designing numerous software projects.

Also, my dual bachelor's degree has provided me a strong understanding of networking, security, system design, and computers.

Furthermore, I usually spend my free time learning new technologies such as Linux, containers, or open-source tools.

So, while it is possible to pass with little experience, it **requires a lot of effort and dedication**.


## How did I prepare for the exam? {#how-did-i-prepare-for-the-exam}

For three months, I dedicated four hours daily to studying. I did more than 1000 exam questions across more than 15 practice exams.

My primary **focus** was **on comprehending AWS services**. Figuring out their strengths and limitations for specific use cases.

I read everything I could about the cloud and learned new methodologies such as the [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html).

These were the specific steps that I took for the exam:

1.  First, I completed the Cantril Course, taking detailed notes on each service.
2.  Subsequently, I attempted my first batch of practice exams, scoring between 50% and 60%.
3.  I then dig deeper into AWS services, consulting the [AWS Docs](https://docs.aws.amazon.com/), [Tutorials Dojo Cheat Sheets](https://tutorialsdojo.com/aws-cheat-sheets/), and [AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/).
4.  For the following month and a half, I did one practice exam every day and noted my mistakes.
5.  By the last week, my scores consistently ranged between 75% and 90%.
6.  Finally, I took the [AWS official mock exam](https://explore.skillbuilder.aws/learn/course/external/view/elearning/14953/exam-prep-aws-certified-solutions-architect-professional-sap-c02-with-practice-material) and scored 830.

Throughout this period, I was **actively engaged with AWS** in my professional and personal projects, implementing IoT and DevOps solutions.


## How was the exam? {#how-was-the-exam}

During the exam, I found that I was familiar with around 70% of the questions. Therefore, **doing a lot of practice exams proved to be beneficial** :)

The time was not an issue, as I had been focusing on completing the practice exams within 2 hours.

The topics that were most discussed were:

-   Serverless everywhere, DynamoDB, API Gateway, and Fargate.
-   Aurora was the norm while RDS was barely mentioned.
-   Direct Connect and Transit Gateways.
-   Hybrid cloud as the king, DX, TGW, storage gateways, DataSync, and AWS Backup.

And also some weird options that I had never heard of:

-   Elastic resize for Redshift.
-   Migration Evaluator.
-   Specific questions about Elastic Beanstalk and Data Exchange.


## Tips to pass the exam! {#tips-to-pass-the-exam}

Studying for the exam:

-   Focus on understanding concepts rather than pure memorization.
-   Do practice exams with the focus on completing them within 2 hours.

Answering questions:

-   Pay close attention to the statement question, particularly regarding cost-effectiveness or operational overhead.
-   Remember that there are usually multiple correct answers, but one aligns better with the question. Taka care!

Scheduling the exam:

-   Schedule the exam in the morning to ensure you are fresh, at least for me.
-   Do the exam in a testing center.
-   If it is the first exam you take, do first the Cloud Practitioner. That way you get a 50% discount and save around 60 euros.
-   If English is not your mother language but you have a good level, you can ask for an extra 30 minutes. Make sure to ask for it before scheduling the exam.

Finally, **learn, practice, learn, practice, learn, practice, and pass**.


## Resources I used to prepare {#resources-i-used-to-prepare}

First of all, [here]({{< relref "20240819100812-aws_solutions_architect_professional_certification_notes.md" >}}) are the notes I created for this certification. You can find an explanation of each service with its use cases.

**Tips: in my notes, the items with the "IMPORTANT:" keyword are taken from practice exams. Search for them! ;)**

Practice exams I did:

-   [Tutorials Dojo](https://tutorialsdojo.com/courses/aws-certified-solutions-architect-professional-practice-exams/) (highly recommended): analogous to the real exam.
-   [AWS Official Mock exam](https://explore.skillbuilder.aws/learn/course/external/view/elearning/14953/exam-prep-aws-certified-solutions-architect-professional-sap-c02-with-practice-material): I used it as the final exam to see if I was ready.
-   [Stephane Maarek](https://www.udemy.com/course/practice-exam-aws-certified-solutions-architect-professional/?couponCode=ST22FS22724) (highly recommended): they are the hardest exams with the best explanations.
-   [Neal Davis](https://www.udemy.com/course/aws-certified-solutions-architect-professional-aws-practice-exams): quite a lot of practice exams. Great explanations with good details.
-   [WhizLabs](https://www.whizlabs.com/aws-solutions-architect-professional/): they are simple, but great as a starting point and doing a lot of exams.

Notes and courses I used:

-   [Cantril Course](https://learn.cantrill.io/p/aws-certified-solutions-architect-professional): a high-level overview of the whole AWS ecosystem. It was my starting point.
-   [Tutorial Dojo Cheat Sheets](https://tutorialsdojo.com/aws-cheat-sheets/): summary of every service with insights.
-   [AWS Docs](https://docs.aws.amazon.com/): everything is here with an in-depth explanation. Worth reading some parts.
-   [AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/): state-of-the-art architecture designs.


## Final thoughts &amp; next steps {#final-thoughts-and-next-steps}

Overall, it has been a great learning experience.

I have learned techniques to design highly available and scalable infrastructure, implement disaster recovery solutions, optimize costs, enhance cloud security, and much more!.

Moving on, I plan to apply this knowledge by:

-   Designing IoT and DevOps solutions in my job.
-   Developing ML pipelines for my association.
-   Exploring more about cloud solutions.
-   Learning about Terraform, and CI/CD methodologies.
