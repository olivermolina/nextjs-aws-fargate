{
  "family": "task-definition-node",
  "networkMode": "awsvpc",
  "requiresCompatibilities": [
    "FARGATE"
  ],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "${ecs_execution_role}",
  "containerDefinitions": [
    {
      "name": "lunahealthapp-image",
      "image": "nginx:latest",
      "memoryReservation": 1024,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000
        }
      ],
      "environment": [
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/aws/ecs/lunahealthapp-prod",
          "awslogs-region": "ca-central-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "secrets": [
          {
            "name": "STYTCH_PROJECT_ENV",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "STYTCH_PROJECT_ID",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "STYTCH_SECRET",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "CUSTOMER_IO_API_KEY",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "JWT_SECRET_KEY",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "SENDGRID_API_KEY",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "AWS_ACCESS_KEY_ID",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "AWS_SECRET_ACCESS_KEY",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "AWS_S3_REGION",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "AWS_S3_BUCKET_NAME",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "QSTASH_URL",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "QSTASH_TOKEN",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "QSTASH_CURRENT_SIGNING_KEY",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "QSTASH_NEXT_SIGNING_KEY",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "MESSAGEBIRD_API_KEY",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "STRIPE_SECRET_KEY",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "STRIPE_WEBHOOK_SECRET",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "PUSHER_APP_ID",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "PUSHER_APP_SECRET",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "GOOGLE_CLIENT_SECRET",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "WHO_ICD_API_CLIENT_ID",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "WHO_ICD_API_CLIENT_SECRET",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "DAILY_API_KEY",
            "valueFrom": "${ssm_arn}"
          },
          {
            "name": "DAILY_REST_DOMAIN",
            "valueFrom": "${ssm_arn}"
          }
        ]
    }
  ]
}
