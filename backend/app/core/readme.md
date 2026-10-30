# First time only
    docker run -d -p 6379:6379 --name chess-redis redis:alpine

# Later, if Redis is stopped
    docker start chess-redis

# Check whether it's running
    docker ps

# check all the container running 
    docker ps -a

# stop container and rm running container
    docker stop <container_name>
    docker rm <container_name>