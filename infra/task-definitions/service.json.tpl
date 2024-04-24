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
          "name": "DATABASE_PASSWORD",
          "valueFrom": "${ssm_db_password_arn}"
        }
      ]
    }
  ]
}
