# bookinfo-practice
![](https://i.ibb.co/0M6JR1X/full-example.png)

### In this exercise we will be deploying an application to a Kubernetes cluster.  
We will be using [this application](https://i.ibb.co/0M6JR1X/full-example.png) and will start from the [kubernetes-practice](https://github.ibm.com/BNPPCloudTeam/kubernetes-practice/tree/kubernetes-exercises/bookinfo-practice) repo(master branch). We already have all the Dockerfiles created and a docker-compose.yaml.   
All the commands were executed in a bash shell and not all of them will work in other shells. You can use Git Bash for Windows. We will be using `bookinfo-practice` folder as the root folder for all the commands.  

Table of contents:   
1. [Deploy the first component to Kubernetes](#i-deploy-the-first-component-to-kubernetes)
2. [Creating a ReplicaSet](#ii-creating-a-replicaset)
3. [Creating a Deployment](#iii-creating-a-deployment)
4. [Kubernetes Services](#iv-kubernetes-services)
5. [Kubernetes Web Dashboard](#v-kubernetes-web-dashboard)
6. [ConfigMaps and Secrets](#vi-configmaps-and-secrets)
7. [Namespaces, probes, Quality of Service and more](#vii-namespaces-probes-quality-of-service-and-more)

### I. Deploy the first component to Kubernetes
We will start with `bookinfo-recommendations`, since is the simplest and has no dependecies.   
We need to prepare the image before deploying it to Kubernetes.

  
**1. Build the image**
```
docker build -t bookinfo-recommendations:1.0 bookinfo-recommendations
```
**2. Test the image**
```
docker run -p 3000:3000 -d --name bookinfo-recommendations bookinfo-recommendations:1.0
```
You can either access the browser at `http://localhost:3000/recommendations-app/all` or you can execute 
```
curl localhost:3000/recommendations-app/all
```

The output should be something like this:
```
[
  "The Pragmatic Programmer",
  "Clean Code",
  "Introduction to Algorithms",
  "The Joy of Cooking",
  "The Defined Dish",
  "Mastering the art of french cooking"
]
```
Remove the container
```
docker rm -f  bookinfo-recommendations
```
**3. Push the image to the `DockerHub`**  
First, you need to create a DockerHub account, then you can execute 
```
docker login
```
It will ask you for the username and the password. After this step is complete you should see the message `Login Succeeded`  
Next we need to tag the image with our repository and push it. 
<pre>
  <code>
docker tag bookinfo-recommendations:1.0 <b>username</b>/bookinfo-recommendations:1.0
docker push <b>username</b>/bookinfo-recommendations
  </code>
</pre>

Where **username** is your DockerHub username, for example: 
```
docker tag bookinfo-recommendations:1.0 marianstanciu15/bookinfo-recommendations:1.0
docker push marianstanciu15/bookinfo-recommendations
```
**4. Create a Kubernetes cluster using minikube**  
minikube recommends using a hypervisor or Docker to run the cluster.  This example is using Docker to run the cluster, but you can specify other hypervisors. 
For Linux: `KVM`, `VirtualBox`  
For Windows: `Hyper-V`, `VirtualBox`  
For Mac: `HyperKit`, `VirtualBox`  
[more info](https://kubernetes.io/docs/setup/learning-environment/minikube/#specifying-the-vm-driver) 
```
$ minikube start --driver=docker
😄  minikube v1.10.1 on Redhat 7.7
✨  Using the docker driver based on user configuration
👍  Starting control plane node minikube in cluster minikube
🚜  Pulling base image ...
💾  Downloading Kubernetes v1.18.2 preload ...
    > preloaded-images-k8s-v3-v1.18.2-docker-overlay2-amd64.tar.lz4: 525.43 MiB
🔥  Creating docker container (CPUs=2, Memory=2200MB) ...
🐳  Preparing Kubernetes v1.18.2 on Docker 19.03.2 ...
    ▪ kubeadm.pod-network-cidr=10.244.0.0/16
🔎  Verifying Kubernetes components...
🌟  Enabled addons: default-storageclass, storage-provisioner
🏄  Done! kubectl is now configured to use "minikube"
```

We can now run `docker ps` to see the container that minikube started and in which our cluster will be running
```
$ docker ps
CONTAINER ID        IMAGE                                 COMMAND                  CREATED             STATUS              PORTS                                                                                                  NAMES
6faa10e050c9        gcr.io/k8s-minikube/kicbase:v0.0.10   "/usr/local/bin/entr…"   51 seconds ago      Up 48 seconds       127.0.0.1:9006->22/tcp, 127.0.0.1:9005->2376/tcp, 127.0.0.1:9004->5000/tcp, 127.0.0.1:9003->8443/tcp   minikube
```

We can check the `kubectl` is connected to the right cluster
```
$ kubectl cluster-info
Kubernetes master is running at https://172.17.0.3:8443
KubeDNS is running at https://172.17.0.3:8443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```
We just created a cluster with a single node which is also the master node.
```
$ kubectl get nodes
NAME       STATUS   ROLES    AGE     VERSION
minikube   Ready    master   9m47s   v1.18.2
```
**5. Create a pod**   
We start by creating a file  called `bookinfo-recommendations-pod.yaml. We will start with the simplest configuration possible. 
```
apiVersion: v1 
kind: Pod 
metadata: 
  name: bookinfo-recommendations  
  labels:  
    app: bookinfo
    tier: backend
    service: recommendations
spec: 
  containers:
  - name: bookinfo-recommendations
    image: marianstanciu15/bookinfo-recommendations:1.0
```

**`apiVersion`** specifies which version of the Kubernetes API you’re using to create this object. We want to create a Pod, one of the core Kubernetes objects that was released with v1(the first stable release). The most common Kubernetes objects were  introduced in either `v1` or `apps/v1`. [Here](https://matthewpalmer.net/kubernetes-app-developer/articles/kubernetes-apiversion-definition-guide.html) is a list with the most commons objects and the apiVersion for each one.
  
**`kind`** specifies the type of object you want to create, in our case a `Pod`   
   
**`metadata`** represents data that helps uniquely identify the object. A `name` or `UID` is required. We can also add extra information like `labels`, which is a key-value list of arbitrary data  

**`spec`** is the description of the object we want to create. The structure of the **spec** is different from object to object, in this case, for a `Pod` we specified the:  
   *  **`containers`** - a list of the containers that we want run in this pod. For each container we specify the name for the container and the image, which will be the image that we push earlier to DockerHub

To deploy this to our cluster we execute:
```
kubectl create -f bookinfo-recommendations-pod.yaml
```

We have check if our application was deployed. To see all the pods in our cluster we execute:
```
$ kubectl get pods
NAME                       READY   STATUS    RESTARTS   AGE
bookinfo-recommendations   1/1     Running   0          46m
```

We can see we have a pod named bookinfo-recommendations, 1/1 under the `READY` columns means that the pod has one container and that container is running. For example, If we have 2 containers, and only one started, we would see in 1/2 in the `READY` column.  
We will see in the chapter about Kubernetes probes how we can pass Kubernetes our own definition of `READY` for our app. 
  
**6. Port forwarding into the pod**  
Next we want to check if our application is actually running correctly.The application is running on port 3000. For now we will use port-forwarding to access the application. We can forward the traffic from a port of the host machine to the Kubernetes pod with this command:  
```
kubectl port-forward bookinfo-recommendations 3001:3000
```
In this case we are forwarding traffic from localhost:3001 to the bookinfo-recommendations pod on port 3000.
Now we can use curl or the browser to make a request to `http://localhost:3001/recommendations-app/all`   
   
**7. Check the logs for a pod**  
We can check the logs with:
```
$ kubectl logs bookinfo-recommendations

> bookinfo-recommendations@1.0.0 start /usr/src/bookinfo-recommendations
> node index.js

Hello! My name is undefined
Recommending a book for localhost:3001
```
**8. Settings environment variables**  
You can see that there is a bug. The message in the logs says 'My name is undefined', that's because the application needs  a environment variable called **LIBRARIAN_NAME**. Let's change the yaml file to pass this value to the container. 

<pre>
<code>
containers:
  - name: bookinfo-recommendations
    image: marianstanciu15/bookinfo-recommendations:1.0
    <b>env:
      - name: LIBRARIAN_NAME
        value: John</b>
</code>
</pre>

We need to delete the pod and recreate it. 
```
kubectl delete pod bookinfo-recommendations
kubectl create -f bookinfo-recommendations-pod.yaml
kubectl get pods
```
If you check the logs again you can see that our problem is fixed.
<pre><code>
$ kubectl logs pod/bookinfo-recommendations 

> bookinfo-recommendations@1.0.0 start /usr/src/bookinfo-recommendations
> node index.js

<b>Hello! My name is John</b>
</code></pre>
  
**9. More information about the pod**  
To get more information about our pod we can run `kubectl describe pod bookinfo-recommendations`  
This command works for every Kubernetes object <code>kubectl describe <b>type</b> <b>name</b></code>  or <code>kubectl describe <b>type</b>/<b>name</b></code> and it will give you more info about that object.

The result is pretty verbose but it will give us a more in depth look at our pod.
<pre>
Name:         bookinfo-recommendations ➊ <i>the name of the pod</i>
Namespace:    default ➋ <i>We can group Kubernetes objects into namespaces, by default all objects that we create go into the default namespace, but we can create and specify other namespaces.</i>
Priority:     0
Node:         minikube/172.17.0.3 ➌ <i>this is the node that our pod was scheduled on to run</i>
Start Time:   Thu, 21 May 2020 17:52:52 +0300 
Labels:       app=bookinfo ➍ <i>we can see the labels we set</i>
              tier=backend
Annotations:  <none>
Status:       Running
IP:           172.18.0.4 ➎ <i>our pod gets automatically an IP adress that is exposed to all the other Kubernetes objects in the same namespace, but you can't reach it from outside the cluster</i>
IPs:
  IP:  172.18.0.4
Containers: ➏ <i>more information about the containers that run inside the pod</i>
  bookinfo-recommendations:
    Container ID:   docker://08aec2840b63ec96dcbb2ac038b254cddbb075ce126a3ae87b603933d87689e7
    Image:          marianstanciu15/bookinfo-recommendations:1.0
    Image ID:       docker-pullable://marianstanciu15/bookinfo-recommendations@sha256:9506c9068a7ed424cb67892b59d82fa0667a239fdc2cf0290c4514624edb40da
    Port:           <none>
    Host Port:      <none>
    State:          Running
      Started:      Thu, 21 May 2020 17:52:53 +0300
    Ready:          True
    Restart Count:  0
    Environment:
      LIBRARIAN_NAME:  John
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-ndqv5 (ro)
Conditions:
  Type              Status
  Initialized       True 
  Ready             True 
  ContainersReady   True 
  PodScheduled      True 
Volumes:
  default-token-ndqv5:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-ndqv5
    Optional:    false
QoS Class:       BestEffort ➐ <i>Quality of Service. We can change this by specifying cpu and memory limits to our pod. This way will be easier for Kubernetes to balance the workload on our cluster. We will see how we can improve this in another chapter</i>
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute for 300s
                 node.kubernetes.io/unreachable:NoExecute for 300s
Events: ➑ <i>Here are the events related to our Pod, this section is a very good starting point for debugging a deploy since we can see any error events related to the object</i>
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  10m   default-scheduler  Successfully assigned default/bookinfo-recommendations to minikube
  Normal  Pulled     10m   kubelet, minikube  Container image "marianstanciu15/bookinfo-recommendations:1.0" already present on machine
  Normal  Created    10m   kubelet, minikube  Created container bookinfo-recommendations
  Normal  Started    10m   kubelet, minikube  Started container bookinfo-recommendations
</pre>

**10. Run a shell inside a container**  
Next, let's try to run a shell inside the container of our pod.
```
kubectl exec -it bookinfo-recommendations -- bash
``` 
If you have multiple containers in a pod you must also specify the container name. In this example we have only one container in the pod so we don't have to do that. 
Now we can run `ls -latr` and see our application inside the container.

We deployed the app but until now we haven't really let Kubernetes manage our pods. We created and deleted them manually. If we want to start more than one, we can't. Also we don't take advantage of Kubernetes self healing abilities, this means that if our application was to go down, we would have to manually restart the pod. To fix this problem we will use a `ReplicaSet` object. 

Before doing that we must clean up the cluster:
```
kubectl delete pod bookinfo-recommendations
```

### II. Creating a ReplicaSet  
  

**1. Declarative vs Imperative configuration management**  
We've been using the `kubectl create` and `kubectl delete` commands until now to create our pods. There is also a `kubectl replace` command. This is the "imperative approach" to Kubernetes, where we have to specify the operation and manage the objects ourselves every time we want to change something.  
  
The Kubernetes recommended approach is the "declarative way", where we supply kubernetes with one or more yaml files. They will represent the **desired state** of our cluster. Based on this, Kubernetes will try to create, modify and delete objects in order to reach this state. For this we will use the `kubectl apply` command to pass the **desired state** to Kubernetes. 
For example, if we pass it the yaml file for our ReplicaSet, it will see that such an object does not exist yet so it has to create it.  
If we modify the yaml file and pass it again, this time it sees that already has the object so it must update it, it will compare, field by field, the new and the old configuration and will update only the fields that changed.      
Also, we can pass multiple files to it by passing a folder. In this case Kubernetes will create all the objects for which it can find a configuration file.  If we remove one configuration file from the folder and pass it again to our cluster, it detects the missing configuration file and will delete the object.
More about Kubernetes declarative and imperative styles of configuration management can be found [here](https://kubernetes.io/docs/concepts/overview/working-with-objects/object-management/), [here](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/) and [here](https://kubernetes.io/docs/tasks/manage-kubernetes-objects/imperative-config/)  
   
**2. Creating the yaml file**  
We will create a file called 'bookinfo-recommendations-replicaset.yaml'
Here is our `ReplicaSet` definition:
```
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: bookinfo-recommendations
  labels:
    app: bookinfo
    tier: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      service: recommendations
  template:
    metadata:
      labels:
        service: recommendations
    spec:
      containers:
      - name: bookinfo-recommendations
        image: marianstanciu15/bookinfo-recommendations:1.0
        env:
          - name: LIBRARIAN_NAME
            value: John
```

We specify we want a `ReplicatSet` object and we also specify the same metadata as we did with our pod since this is the object we will be interacting with from now on, this is our app now.   
We see we have to specify more information for the spec object:  
  * **`replicas`** - the number of pod/instances we want of our app
  * **`selector`** - the ReplicaSet will use this selector to identify the pods it  needs to control(scale out, scale down, restart etc). This is based on the labels. 
  * **`template`** - is the template for the pods that will be run by the ReplicaSet and it's basically a pod definition without the 'apiVersion' and 'kind' fields. We also don't have to specify a name, Kubernetes will generate the name of each pod from the 'ReplicaSet' name. The label is very important here because it has to match the `selector`
  
**3. Deploy the replicaset**    
Let's deploy our `ReplicaSet` using the declarative way. 
```
kubectl apply -f bookinfo-recommendations-replicaset.yaml
```

If we look now at our cluster we see we have 2 pods deployed to the cluster, that means our ReplicaSet was succesfully created and it already did it's job. 
```
$ kubectl get pods
NAME                             READY   STATUS    RESTARTS   AGE
bookinfo-recommendations-249q9   1/1     Running   0          6s
bookinfo-recommendations-8dq8c   1/1     Running   0          6s
```
**4. A closer look to the replicaset**  
Let's look closer at one of the pods first(the pod name might be different for you):
```
kubectl describe pod bookinfo-recommendations-249q9
```
<pre>
<code>
...
IPs:
  IP:           172.18.0.5
<b>Controlled By:  ReplicaSet/bookinfo-recommendations</b>
Containers:
  bookinfo-recommendations:
...</code></pre>
We see a new field here `Controlled By:  ReplicaSet/bookinfo-recommendations`. This means this pod is managed by a replicaset. Let's take a closer look at that object now. 
<pre><code>
#any of this four commands will work the same
$  <b>kubectl describe rs bookinfo-recommendations</b> 
# kubectl describe replicaset bookinfo-recommendations
# kubectl describe rs/bookinfo-recommendations
# kubectl describe replicaset/bookinfo-recommendations
</code></pre>
<pre><code>
Name:         bookinfo-recommendations
Namespace:    default
Selector:     service=recommendations
Labels:       app=bookinfo
              tier=backend
Annotations:  kubectl.kubernetes.io/last-applied-configuration: ➊
                {"apiVersion":"apps/v1","kind":"ReplicaSet","metadata":{"annotations":{},"labels":{"app":"bookinfo","tier":"backend"},"name":"bookinfo-rec...
Replicas:     2 current / 2 desired  ➋
Pods Status:  2 Running / 0 Waiting / 0 Succeeded / 0 Failed 
Pod Template:  ➌
  Labels:  service=recommendations
  Containers:
   bookinfo-recommendations:
    Image:      marianstanciu15/bookinfo-recommendations:1.0
    Port:       <none>
    Host Port:  <none>
    Environment:
      LIBRARIAN_NAME:  John
    Mounts:            <none>
  Volumes:             <none>
Events:                
  Type    Reason            Age   From                   Message
  ----    ------            ----  ----                   -------
  Normal  SuccessfulCreate  19m   replicaset-controller  Created pod: bookinfo-recommendations-skvb4
  Normal  SuccessfulCreate  19m   replicaset-controller  Created pod: bookinfo-recommendations-jdhhz
</code></pre>
➊ Kubernetes added a annotation for our object. Annotations are similar to labels, but they are not used to identify the app, they are used just as extra information about the object. In this case Kubernetes added the last applied configuration(yaml file), so next time we do a `kubectl apply` for this object it will compare it with this version to see what must be changed.   
➋ The replicaset will track the number of replicas/instances. If one of the pods goes down, it will bring another one up.   
➌ The replicaset also has the template for our pods  

We can also see all of our replicasets by running: 
```
$ kubectl get rs
NAME                       DESIRED   CURRENT   READY   AGE
bookinfo-recommendations   2         2         2       178m
```
**5. Self healing**  
Now let's expore the self healing capabilities of Kubernetes. Our application has one GET endpoint that once called it will kill the process: `recommendations-app/kill`. We will use this to simulate a crash in our app and see if Kubernetes will restart the container. 

We will do a port-forward from our host to the container inside one of the Kubernetes pods. The pod name might be different for you. 
<pre><code>
$ kubectl get pods
NAME                             READY   STATUS    RESTARTS   AGE
<b>bookinfo-recommendations-jdhhz</b>   1/1     Running   0          7m8s
bookinfo-recommendations-skvb4   1/1     Running   0          7m8s
$ kubectl port-forward <b>bookinfo-recommendations-jdhhz</b> 3000:3000
</code></pre>

Open a new bash terminal and execute `watch kubectl get pods`. This will refresh the information about your pods every second so you can see it in real time. 
Make a GET request in your browser at `localhost:3000/recommendations-app/kill` while keeping open the terminal with the `watch command`. You should see that one of the pods will change its status to 'Error' for a few seconds

<pre><code>
$ watch kubectl get pods
NAME                             <b>READY</b>   <b>STATUS</b>    RESTARTS   AGE
<b>bookinfo-recommendations-jdhhz</b>   <b>0/1</b>     <b>Error</b>     0          7m12s
bookinfo-recommendations-skvb4   1/1     Running   0          7m12s
</pre></code>

Then the status should change back to running after a few seconds, but look at the 'RESTARTS' column
<pre><code>
$ watch kubectl get pods
NAME                             READY   STATUS    <b>RESTARTS</b>   AGE
<b>bookinfo-recommendations-jdhhz</b>   1/1     Running   <b>1</b>          7m16s
bookinfo-recommendations-skvb4   1/1     Running   0          7m16s
</pre></code>

The replicaset noticed that the container inside the pod crashed so it automatically restarted it.
If we delete a pod (we simulate in this way that something was wrong with the whole pod) the replicaset will just create another one. Let's try this too. Keep 2 terminals open in the same time, in one of them run `watch kubectl get pods` so we track the pods in real time. 

<pre><code>
$ watch kubectl get pods                                                                                            

NAME                             READY   STATUS    RESTARTS   AGE
bookinfo-recommendations-<b>jdhhz</b>   1/1     Running   1          29m
bookinfo-recommendations-<b>skvb4</b>   1/1     Running   0          29m
</code></pre>

I have 2 containers called **jdhhz** and **skvb4**, you might have different names. I will delete the first one
```
kubectl delete pod bookinfo-recommendations-jdhhz 
```

<pre><code>
$ watch kubectl get pods

NAME                             READY   STATUS              RESTARTS   AGE
<b>bookinfo-recommendations-6xdsh   0/1     ContainerCreating   0   	1s</b>
bookinfo-recommendations-skvb4   1/1     Running             0   	36m
<b>bookinfo-recommendations-jdhhz   0/1     Terminating         0		36m</b>
</pre></code>

<pre><code>
$ watch kubectl get pods

NAMEE                             READY   STATUS    RESTARTS   AGE
<b>bookinfo-recommendations-6xdsh   1/1     Running   0           40s</b>
bookinfo-recommendations-skvb4   1/1     Running   0   	       37m
</pre></code>

You can see how fast the replicaset start a new pod, it doesn't even wait for the old one to completely exit.   
  
**6. Scale up the application**  
There are multiple ways to achieve this. First let's try by modifying the yaml file and applied it again. We will scale from 2 to 4 instances. 
<pre><code>
....
spec:
  replicas: <b>4</b>
...
</code></pre>

```
kubectl apply -f bookinfo-recommendations-replicaset.yaml
```

<pre><code>
$ kubectl get pods

NAME                             READY   STATUS    RESTARTS   AGE
bookinfo-recommendations-6xdsh   1/1     Running   0   	      32m
bookinfo-recommendations-skvb4   1/1     Running   0	      68m
<b>bookinfo-recommendations-tctl4   1/1     Running   0          16s
bookinfo-recommendations-n2d45   1/1     Running   0          16s</b>
</code></pre>

The replicaset created 2 more pods automatically. Let's take a look at the events in our replicaset
<pre><code>
....
Events:
  Type    Reason            Age    From                   Message
  ----    ------            ----   ----                   -------
  Normal  SuccessfulCreate  35m    replicaset-controller  Created pod: bookinfo-recommendations-tqv8r
  Normal  SuccessfulCreate  35m    replicaset-controller  Created pod: bookinfo-recommendations-6xdsh
  <b>Normal  SuccessfulCreate  3m12s  replicaset-controller  Created pod: bookinfo-recommendations-n2d45
  Normal  SuccessfulCreate  3m12s  replicaset-controller  Created pod: bookinfo-recommendations-tctl4</b>
</code></pre>

We can see when the last 2 pods where created compared to the other two, they were not created at the same moment, so by running `kubectl apply` we updated the replicaset.   
Another way to achieve this will be using this command:
```
kubectl scale --replicas=2 rs bookinfo-recommendations
```

This time we scaled down our application, from 4 instances to just 2 instances
```
$ kubectl get pods
NAME                             READY   STATUS    RESTARTS   AGE
bookinfo-recommendations-6xdsh   1/1     Running   0          35m
bookinfo-recommendations-tctl4   1/1     Running   0          5m12s
```


You can read more about `ReplicaSet` objects [here](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/#how-a-replicaset-works).  

Now Kubernetes takes care of our pods for us, we can start up a bunch of them and we also used some Kubernetes self healing features. But now let's say we want to update our application, deploy version 2.0. How do we update it with 0 downtime? What if we want to have 2 versions running in parallel? And if something goes wrong how can we rollback to the previous version? Kubernetes solution for this is another object called a `Deployment` and we will see how to create one and how to take advantage of it.

We need to clean up the cluster
```
kubectl delete rs bookinfo-recommendations
```

### III. Creating a Deployment
  
**1. Create a deployment yaml**  
A `Deployment` is a Kubernetes object that manages multiple versions or revisions. 
A deployment is the idea of associating a new revision to a new replicaset and manage all the replicasets created this way through a single object. This way you can control which replicaset(revision) is active and how the transition from one replicaset to another is made.

Let's create a new yaml file 'bookinfo-recommentations-deployment.yaml'. The yaml files for our replicaset and our deployment are very similar
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bookinfo-recommendations
  labels:
    app: bookinfo
    tier: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      service: recommendations
  template:
    metadata:
      labels:
        service: recommendations
    spec:
      containers:
      - name: bookinfo-recommendations
        image: marianstanciu15/bookinfo-recommendations:1.0
        env:
          - name: LIBRARIAN_NAME
            value: John
```

The only difference here is the **`kind`** attribute which is in this case `Deployment`. But let's apply this to the cluster to see what will actually create.  
  
**2. Creating the deployment**  
```
kubectl apply -f bookinfo-recommendations-deployment.yaml
```
To see all the objects we can do 
```
$ kubectl get all
NAME                                            READY   STATUS    RESTARTS   AGE
pod/bookinfo-recommendations-7d9d76bb8c-nj9q8   1/1     Running   0          18s
pod/bookinfo-recommendations-7d9d76bb8c-q8sqb   1/1     Running   0          18s

NAME                                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/bookinfo-recommendations-7d9d76bb8c   2         2         2       18s

NAME                                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/bookinfo-recommendations   2/2     2            2           18s
```

We see that we created a deployment, a replicaset and 2 pods. Let's take a closer look at the replicaset that was created.   
  
**3. Taking a closer look to the deployment** 

```
kubectl describe rs bookinfo-recommendations-7d9d76bb8c
```

<pre><code>
Name:           bookinfo-recommendations-7d9d76bb8c
Namespace:      default
Selector:       pod-template-hash=7d9d76bb8c,service=recommendations ➊
Labels:         pod-template-hash=7d9d76bb8c ➋
                service=recommendations
Annotations:    deployment.kubernetes.io/desired-replicas: 2 ➌
                deployment.kubernetes.io/max-replicas: 3 ➍
                deployment.kubernetes.io/revision: 1 ➎
Controlled By:  Deployment/bookinfo-recommendations  ➏
Replicas:       2 current / 2 desired
.......
</pre></code>
 ➊ and ➋ - Kubernetes added a label to our replicaset called pod-template-hash which is actually the hash of the template object in our deployment. Any modification in the template object will trigger a new revision so a new replica will be created too. This label is also used as a selector. Kubernetes will associate each revision with a template hash and this way it identifies which replicaset is the right one for each revision  
➌ and ➍ and ➎ - more information for Kubernetes to check on the replicaset if it behaves correctly  
➏ - just like we've seen with pods controlled by a replicaset, this replicaset is controller by a deployment  

Now let's take a look at our deployment 
```
kubectl describe deployment.apps/bookinfo-recommendations
```
```
Name:                   bookinfo-recommendations
Namespace:              default
CreationTimestamp:      Fri, 22 May 2020 18:40:15 +0300
Labels:                 app=bookinfo
                        tier=backend
Annotations:            deployment.kubernetes.io/revision: 1 ➊
                        kubectl.kubernetes.io/last-applied-configuration:
                          {"apiVersion":"apps/v1","kind":"Deployment","metadata":{"annotations":{},"labels"...
Selector:               service=recommendations
Replicas:               2 desired | 2 updated | 2 total | 2 available | 0 unavailable
StrategyType:           RollingUpdate ➋ 
MinReadySeconds:        0 ➌ 
RollingUpdateStrategy:  25% max unavailable, 25% max surge ➍
Pod Template:
  Labels:  service=recommendations
  Containers:
   bookinfo-recommendations:
    Image:      marianstanciu15/bookinfo-recommendations:1.0
    Port:       <none>
    Host Port:  <none>
    Environment:
      LIBRARIAN_NAME:  John
    Mounts:            <none>
  Volumes:             <none>
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable
OldReplicaSets:  <none> ➎
NewReplicaSet:   bookinfo-recommendations-7d9d76bb8c (2/2 replicas created) ➏
Events:
  Type    Reason             Age   From                   Message
  ----    ------             ----  ----                   -------
  Normal  ScalingReplicaSet  31m   deployment-controller  Scaled up replica set bookinfo-recommendations-7d9d76bb8c to 2
```

➊ - it indicates that this deployment is currently at revision(version) 1.   
➋ - switching from one revision to another requires a strategy for replacing the old pods, controlled by the old replicaset with the new pods, controlled by the new replicaset. There are multiple strategies you can use, but a Deployment only supports 2 types of its own, without other Kubernetes objects:   
  * **Recreate** - is the simplest strategy. First, all the old pods will be destroyed, when all of them terminated, the new ones are started. This will cause some downtime and is not recommended
  * **RollingUpdate** - is the default strategy. One of the new pods is started, when it is ready, one of the old ones is destroyed and the process repeats until all the pods are replaced.   
    
For more information about other strategies for updates check this [article](https://dzone.com/articles/kubernetes-deployment-strategies) (ignore the Weaveworks Flagger part)   
  
➌ - during a rolling update, if a new pod is ready for 'MinReadySeconds' specified than it will be available to receive traffic.  
➍ With this 2 properties you can set the RollingUpdate strategy speed
  * max unavailable - The maximum number of pods that can be unavailable during the update
  * max surge The maximum number of pods that can be scheduled above the desired number of pods    
  
➎ the replicaset that is being replaced, this property will have a value only when a update is progress  
➏ the current replicaset active  

 
  

**4. Rolling a new version of the app**  
Let's try to update our application by adding a new book to our recommendations.   
Modify the `index.js` in the bookinfo-recommendations and add "Kubernetes in Action" to the `programmingBooks` array (line 29);
<pre><code>
const programmingBooks = ["The Pragmatic Programmer", "Clean Code", "Introduction to Algorithms", <b>"Kubernetes in Action"</b>];
</pre></code>

We can rebuild and push the image to the Dockerhub registry. Please notice the new tag
<pre><code>
docker build -t marianstanciu15/bookinfo-recommendations:<b>2.0</b> bookinfo-recommendations
docker push marianstanciu15/bookinfo-recommendations:<b>2.0</b>
</pre></code>

Now we must modify our deployment to update the version of the image we are using
<pre><code>
spec:
  containers:
    - name: bookinfo-recommendations
      <b>image: marianstanciu15/bookinfo-recommendations:2.0</b>
</pre></code>

Let's deploy this new configuration to Kubernetes
```
kubectl apply -f bookinfo-recommendations-deployment.yaml
```

Let's see what objects we have now
```
$ kubectl get all
NAME                                           READY   STATUS    RESTARTS   AGE
pod/bookinfo-recommendations-99789f596-866s9   1/1     Running   0          26s
pod/bookinfo-recommendations-99789f596-9ssgb   1/1     Running   0          21s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   27h

NAME                                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/bookinfo-recommendations   2/2     2            2           88m

NAME                                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/bookinfo-recommendations-7d9d76bb8c   0         0         0       88m
replicaset.apps/bookinfo-recommendations-99789f596    2         2         2       26s
```

We see that we now have 2 replicasets, but one of the has the desired number of pods set to 0. That is the replicaset that corresponds to our old deployment. 

Let's look at the new replicaset
<pre><code>
...
Labels:         <b>pod-template-hash=99789f596</b>
                service=recommendations
Annotations:    deployment.kubernetes.io/desired-replicas: 2
                deployment.kubernetes.io/max-replicas: 3
                <b>deployment.kubernetes.io/revision: 2</b>
....
  Containers:
   bookinfo-recommendations:
    <b>Image:      marianstanciu15/bookinfo-recommendations:2.0</b>
</pre></code>
We see that this replicaset has a different template hash, the annotation now says revision 2 and we also see the image tag was updated. 

You can now do a port-forwarding to one of the pods and check if the new book shows up.   

**5. Revision Management**  
We can see the history of our revisions
```
$ kubectl rollout history deployment bookinfo-recommendations

deployment.apps/bookinfo-recommendations 
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
```

We can rollback to the previous revisions
```
kubectl rollout undo deployment bookinfo-recommendations
```

Or we can rollout a specific revision, let's say we want to change back to revision 2
```
kubectl rollout undo deployment bookinfo-recommendations --to-revision=2
```
  
**5. Scaling a deployment**
    
A deployment can be scaled the same way as a replicaset, the scaling will be applied to the currently active replicaset. 

```
kubectl scale --replicas=4 deployment bookinfo-recommendations
```

```
kubectl get pods
```



You can read more about the `Deployment` object [here](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)  
For the next exercise you must clean the cluster again
```
kubectl delete deployment bookinfo-recommendations
```


### IV. Kubernetes Services

**1. Deploying the second component of our app**  
Before we create a Kubernetes Service let's try to understand why we need it in the first place.  

Let's create a new folder called `bookinfo-kubernetes` in the `bookinfo-practice` folder and copy here only the deployment that we created earlier 'bookinfo-recommendations-deployment.yaml'.
This will be the folder where we keep our yaml files from now on. 

Let's create an image for another component of our app `bookinfo-ui` and push it to the registry. Don't forget to replace the username with your own. 
```
docker build -t marianstanciu15/bookinfo-ui:1.0 bookinfo-ui
docker push marianstanciu15/bookinfo-ui:1.0
```
Let's build a new Deployment for it 'bookinfo-ui-deployment.yaml' in the `bookinfo-kubernetes` folder (don't forget to change the image name with your username)
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bookinfo-ui
  labels:
    app: bookinfo
    tier: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      service: angular-ui
  template:
    metadata:
      labels:
        service: angular-ui
    spec:
      containers:
      - name: bookinfo-ui
        image: marianstanciu15/bookinfo-ui:1.0
```

Now we can execute `kubectl apply` for the folder `bookinfo-kubernetes`
```
kubectl apply -f bookinfo-kubernetes
```

And let's see what objects were created
```
$ kubectl get all
NAME                                           READY   STATUS    RESTARTS   AGE
pod/bookinfo-recommendations-99789f596-kvkrc   1/1     Running   0          71s
pod/bookinfo-recommendations-99789f596-m84js   1/1     Running   0          71s
pod/bookinfo-ui-5766dc5785-z56pn               1/1     Running   0          71s

NAME                                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/bookinfo-recommendations   2/2     2            2           71s
deployment.apps/bookinfo-ui                1/1     1            1           71s

NAME                                                 DESIRED   CURRENT   READY   AGE
replicaset.apps/bookinfo-recommendations-99789f596   2         2         2       71s
replicaset.apps/bookinfo-ui-5766dc5785               1         1         1       71s
```

We have 2 deployments, 2 replica sets and 3 pods (2 bookinfo-recommendations and 1 bookinfo-ui)   
The `bookinfo-ui` pod does have an IP address, but is not accessible from outside the cluster so we have to use port-forward. 
```
kubectl port-forward pod/bookinfo-ui-5766dc5785-z56pn 4200:80
```
If we access the application from the browser `localhost:4200` we see that it does not work, no books are displayed.   
The application that is running in the `bookinfo-ui` pod is supposed to call the `bookinfo-recommendations` app to get the list of recommended books but it does not know how to reach it, what's his IP address. We can get the `bookinfo-recommendations` IP and just use that from the `bookinfo-ui` but what happens if `bookinfo-recommendations` goes down and comes back up but with a different IP? Also which one of the `bookinfo-recommendations` instances should we use? How do we balance the traffic between them?   

**2.Use cases for Kubernetes Services**  
This are 3 of the problems that a `Service` wants to resolve.   
How do applications find each other inside the cluster?  
How do we load balanced the traffic between the pods of the same deployment?  
How do we expose our application outside of the cluster, to the users?   

A service is an object that stays in front of a group of pods and all traffic to the pods go through the service that also does load balancing between the pods.  
The service itself has an IP address that can be used to call the applications behind it. We can install inside the cluster a DNS server to resolve the service name to the service IP address so we can just call it by name. Minikube and most of the cloud providers come with a DNS server by default so we don't have to do anything to set that up. 
A service can be one of four types:  
  * ClusterIP - accesible only inside the cluster
  * NodePort - exposes an IP address outside the cluster
  * LoadBalancer - creates a service that uses an external load balancer, this is usually provided by the cloud vendor
  * ExternalName - this type of service stays in front of an external service that a pod inside the cluster might call. Maybe the database is not running inside the Kubernetes cluster or you have to call a 3rd party API, you can create a service in front of that and call the service instead from  your pod. 


**3. Creating a ClusterIP Service**
Let's start with a ClusterIP, we want such a service for our `bookinfo-recommendations` which should be accessible only inside the cluster, to be consumed by `bookinfo-ui`. We will start by creating a file 'bookinfo-recommendations-service.yaml'
```
apiVersion: v1
kind: Service
metadata:
  name: bookinfo-recommendations
spec:
  selector:
    service: recommendations
  ports:
    - port: 3000
```

* **`metadata`** we specify the service name which will also be used as a domain name, so instead of using the service IP we can call by this name
* **`selector`** we select the pods with the label 'service: recommendations'
* **`ports`** the port that our service will listen on, by default it will proxy traffic to the pods on the same port. If we want to expose a port through a service but the pods are actually listening on another port we have to specify a property called `targetPort` so that traffic arrives on the right port in the pods.   

If we do not specify a type for our service, by default, it will be a ClusterIP Service. 

Let's update our cluster 
```
kubectl apply -f bookinfo-kubernetes
```
<pre><code>
$ kubectl get services
NAME                       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
<b>bookinfo-recommendations   ClusterIP   10.104.175.66   <none>        3000/TCP   88m</b>
kubernetes                 ClusterIP   10.96.0.1       <none>        443/TCP    30h
</pre></code>

Our service is now created. We see it's type, ClusterIP, it's IP address and the port that is listening on.    
Ignore the 'kubernetes' service, is created by minikube by default.

Let's taste again the application by using port-forwarding
```
kubectl port-forward bookinfo-ui-9b85d4cf-9mvvh 4200:80
``` 

If you open the browser on localhost:4200 the 'Get recommentations' feature should work now.   

**3. Creating a NodePort Service**
Let's create a service that will expose our app externally.
Create `bookinfo-ui-service.yaml`
```
apiVersion: v1
kind: Service
metadata:
  name: bookinfo-ui
spec:
  selector:
    service: angular-ui
  ports:
    - port: 80
  type: NodePort
```

It's very similar to the ClusterIP service, we just specified the type `NodePort`. `bookinfo-ui` pod has the label 'service: angular-ui' and listens on port 80 so we had to change that too. 

```
kubectl apply -f bookinfo-kubernetes
```
<pre><code>
$ kubectl get services
NAME                       TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
bookinfo-recommendations   ClusterIP   10.104.175.66   <none>        3000/TCP       97m
<b>bookinfo-ui                NodePort    10.111.253.94   <none>        80:32226/TCP   4m57s</b>
kubernetes                 ClusterIP   10.96.0.1       <none>        443/TCP        31h
</code></pre>

To get the address of our app we can run `minikube service bookinfo-ui --url`. 
This will actually give us the minikube node IP and the nodePort: 'http://minikube_node_ip:nodePort'
We will see next why we can't use the service IP address.

**5. A closer look at Services**
  
Let's take a closer look at our services. Let's try with the ClusterIP.
<pre><code>
$ kubectl describe service bookinfo-recommendations

Name:              bookinfo-recommendations
Namespace:         default
Labels:            <none>
Annotations:       kubectl.kubernetes.io/last-applied-configuration:
                     {"apiVersion":"v1","kind":"Service","metadata":{"annotations":{},"name":"bookinfo-recommendations","namespace":"default"},"spec":{"ports":...
Selector:          service=recommendations
Type:              ClusterIP  
IP:                10.104.175.66  ➊
Port:              <unset>  3000/TCP
TargetPort:        3000/TCP  ➋  
Endpoints:         172.18.0.5:3000,172.18.0.6:3000  ➌
Session Affinity:  None ➍
Events:            <none>
</code></pre>

➊ the IP address that was allocated to our Service  
➋ the service will forward the requests to this port on the backend pods   
➌ this is the list of pods IPs that are going to be load balanced by this service  
➍ you can set this property to ClientIP if you want to create a sticky session(once a client request is sent to a pod, all subsequent requests from that client will be sent to the same pod)  

Now let's look at the NodePort Service
```
$ kubectl describe service bookinfo-ui

...
Type:                     NodePort
IP:                       10.111.253.94
Port:                     <unset>  80/TCP
TargetPort:               80/TCP
NodePort:                 <unset>  32226/TCP ➊
...
```

We see that it look almost the same as the ClusterIP, it receives traffic on port 80 and sends it forward to the pods on the target port, 80. So traffic coming from inside the cluster can still be received on port 80. 
However, it does have another port called nodePort(➊), that will be accesible from outside the cluster. You can specify this port, but Kubernetes can manage this for us so we don't have to deal with eventual port conflicts. 

A NodePort is actually just a ClusterIP and can be used as one but we still can't use the service IP to access it from outside the cluster. We have to use one of the nodes IPs. It doesn't matter which node, because the kube-proxy component will take care of routing the request to the correct location. 

How it actually works?  
Let's say we have a cluster with 3 nodes(machines), each one with an IP accessible from the internet. Also, each one of those nodes have a process running called a kube-proxy. Each kube-proxy knows about all the services in the whole cluster.
By creating a NodePort we are doing 2 things: 
1. Create a ClusterIP 
2. Tell all the kube-proxies to listen on the nodePort specified. 

When a request is made, the kube-proxy looks for the ClusterIP service that is associated with the nodePort and sends the traffic there.


You can read more about services [here](https://kubernetes.io/docs/concepts/services-networking/service/)


### V. Kubernetes Web Dashboard

Kubernetes also provides a web-based user interface. We can access it in minikube with `minikube dashboard`. This should automatically open a new page in the browser.
![](https://i.ibb.co/2YLxWWv/dashboard.png)

### VI. ConfigMaps and Secrets


**1. Create a ConfigMap**  
A `ConfigMap` is a Kubernetes object that can store data in key-value pairs. We can use it to pass environment variables to our pods. 
A `ConfigMap` will help in decoupling the application from the environment even more. For example, we can have the same deployment for local and cloud environment and keep all the environment specific information in a ConfigMap. 

Let's create one in which we will store the `LIBRARIAN_NAME` variable for our `book-recommendations`. Create a file called `book-recommendations-configmap.yaml`
```
apiVersion: v1
kind: ConfigMap
metadata:
  name: book-recommendations-configmap
data:
  LIBRARIAN_NAME: "Ion" 
```
The `name` in the metadata object will be used to reference this configmap.  
The `data` object is where we can define our key-value pairs.  

Let's configure the deployment to use this ConfigMap. 
<pre><code>
...
spec:
      containers:
      - name: bookinfo-recommendations
        image: marianstanciu15/bookinfo-recommendations:2.0
        env:
          - name: LIBRARIAN_NAME
            <strike>value: John</strike>
            <b>valueFrom:
              configMapKeyRef:
                name: book-recommendations-configmap
                key: LIBRARIAN_NAME</b>
...
</code></pre> 

Let's apply the new configuration
<pre><code>
$ kubectl apply -f bookinfo-kubernetes/
<b>configmap/book-recommendations-configmap created
deployment.apps/bookinfo-recommendations configured</b>
service/bookinfo-recommendations unchanged
deployment.apps/bookinfo-ui unchanged
service/bookinfo-ui unchanged
</code></pre>

Our configmap was created and `bookinfo-recommendations` deployment was updated.
We can also see our new pods
<pre><code>
$ kubectl get pods
NAME                                      READY   STATUS    RESTARTS   AGE
<b>bookinfo-recommendations-b558bbd9-rmrt5   1/1     Running   0          3m46s
bookinfo-recommendations-b558bbd9-x79vx   1/1     Running   0          3m41s</b>
</code></pre>

Let's take a look at the logs, see if the environment variable changed. 
<pre><code>
$ kubectl logs bookinfo-recommendations-b558bbd9-rmrt5

> bookinfo-recommendations@1.0.0 start /usr/src/bookinfo-recommendations
> node index.js

<b>Hello! My name is Ion</b>
</code></pre>

In this example we specified a key from our configmap, but we can pass all the variables at once to our pod. For this we have to change again our deployment config.

<pre><code>
spec:
      containers:
      - name: bookinfo-recommendations
        image: marianstanciu15/bookinfo-recommendations:2.0
        <strike>env:
          - name: LIBRARIAN_NAME
            valueFrom:
              configMapKeyRef:
                name: book-recommendations-configmap
                key: LIBRARIAN_NAME</strike>
        envFrom:
          - configMapRef:
              name: book-recommendations-configmap
</code></pre>

```
kubectl apply -f bookinfo-kubernetes
kubectl get pods
kubectl logs bookinfo-recommendations-5df6bd96c7-966fd
```

We can also use a ConfigMap to hold configuration files and then we can mount them to our pods.   
For this example we will use a configmap to configure the nginx server that is serving our angular app. 

Let's take a look at the Dockerfile for our `bookinfo-ui`
<pre><code>
FROM node:14-slim as builder
WORKDIR '/usr/src/bookinfo'
COPY package*.json ./
RUN npm install
COPY . .

FROM builder as dev
CMD ["npm", "run", "start"]

FROM builder as prod-builder
RUN npm run build

<b>FROM nginx:1.17.10-alpine as prod-without-config</b>
COPY --from=prod-builder /usr/src/bookinfo/dist/bookinfo-ui /usr/share/nginx/html

FROM prod-without-config as prod
<b>COPY nginx.conf /etc/nginx/conf.d/default.conf</b>
</code></pre>

The final stage called `prod` is already copying the configuration files. This means that if we change something in the nginx configuration we will have to rebuild and push the image. 
What we want to use is the `prod-without-config` stage which contains just the angular application. 

Let's build it by specifying the target stage and push this image. Don't forget to change the username.
<pre><code>
docker build -t marianstanciu15/bookinfo-ui:<b>2.0</b> <b>--target prod-without-config</b> bookinfo-ui
docker push marianstanciu15/bookinfo-ui:<b>2.0</b>
</code></pre>

We also have to change the `bookinfo-ui-deployment.yaml` to use the new image. 
<pre><code>
...
image: marianstanciu15/bookinfo-ui:<b>2.0</b>
...
</code></pre>

Let's apply this new configuration and test the application
```
kubectl apply -f bookinfo-kubernetes
minikube service bookinfo-ui --url
```

The application no longer works because it no longer has the nginx configuration file. 
Let's fix this with a configmap. Create a file called `bookinfo-ui-configmap.yaml`.
<pre><code>
apiVersion: v1
kind: ConfigMap
metadata:
  name: book-ui-configmap
data:
  default.conf: |
    server {
        listen       80;
        server_name  localhost;
        resolver kube-dns.kube-system.svc.cluster.local. valid=30s;

        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
        }

        location /details-app {
            set $bookinfo_details_host http://bookinfo-details.default.svc.cluster.local:3000;
            proxy_pass $bookinfo_details_host;
        }

        location /reviews-app {
            set $bookinfo_reviews_host http://bookinfo-reviews.default.svc.cluster.local:8080;
            proxy_pass $bookinfo_reviews_host;
        }

        location /ratings-app {
            set $bookinfo_ratings_host http://bookinfo-ratings.default.svc.cluster.local:8080;
            proxy_pass $bookinfo_ratings_host;
        }

        location /recommendations-app {
            set $bookinfo_ratings_host http://bookinfo-recommendations.default.svc.cluster.local:3000;
            proxy_pass $bookinfo_ratings_host;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    } 
</code></pre>

We pass the file content as a value to the `default.conf` key by using the `|` symbol. This symbol let's you write a multiline string in a yaml file. 
The key is also important here, Kubernetes will pass this value as a file and the file name will be the key. We have to call it `default.conf` because nginx is looking for a file with this name. 

Let's add this config to our deployment. 
We will add  a `volumes` entry to our spec, define one volume and then reference that volume from our container definition. 
<pre><code>
spec:
      <b>volumes:
        - name: nginx-config
          configMap: 
            name: book-ui-configmap</b>
      containers:
      - name: bookinfo-ui
        image: marianstanciu15/bookinfo-ui:2.0
        <b>volumeMounts:
          - name: nginx-config
            mountPath: /etc/nginx/conf.d</b>
</code></pre>
We added a `volumes` entry to our spec object. We specify a volume called `nginx-config` and this volume will actually be a file coming from our configmap. 
We also have to reference that volume in our container(`volumeMounts`) and the mounting point(`mountPath`), where Kubernetes will put the file coming from the configmap. 

Let's reapply this configuration and test the application again
<pre><code>
kubectl apply -f bookinfo-kubernetes/
# make sure the new pod started
kubectl get pods
# you can test the application on localhost:4200
</code></pre>

We can see the configmaps in the cluster with this command:
```
kubectl get configmaps
```

You can read more about `ConfigMap` [here](https://kubernetes.io/docs/concepts/configuration/configmap/) and [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-pod-configmap/).

**2. Create a Secret**  
Secret are similar to ConfigMaps, we can use it to hold data as key-value pairs but they are handled more careful by Kubernetes than ConfigMaps. They are not saved on disk on none of the working nodes and are only kept in the `etcd` database on the master.   
We should put in a secret configuration that is sensitive, like a database password or an api key and access to those objects should be less permissive. Also, we should not be keeping the secret configuration files in the project. 

Let's try to pass our `LIBRARIAN_NAME` as a secret to `bookinfo-recommendations`.
For our example we will keep the configuration in the project since is not really a security concern.  Let's create a `bookinfo-recommendations-secret.yaml`.
<pre><code>
apiVersion: v1
kind: Secret
metadata:
  name: librarian-secret
type: Opaque
data:
  LIBRARIAN_NAME: Sm9obgo=
</code></pre>

We need to specify the type of Secret. Kubernetes has support for special types of secrets, like TLS certificates, private registry credentials, Basic Auth, SSH Auth. For this example we will be using 'Opaque' type which is a generic type where we can define keys ourselves.
The key is in clear text but the value needs to be encoded in base64 (encoding does not provide any security, it's the same as clear text from a security point of view).

You can encode a string using the `base64` utility in `bash`  
Ex: `echo John | base64`  
Output: `Sm9obgo=`  

We could also create a secret using only the kubectl:
```
kubectl create secret generic librarian-secret --from-literal=LIBRARIAN_NAME=John
```

Notice that we don't have to  encode the value when we use this method. 
We used `--from-literal` to pass the values on the command line, but you should use `--from-file` to pass multiple values from a file since passwords on the command line are not a good idea. 

Let's modify the deployment to use the value from the secret (`bookinfo-recommendations-deployment.ymal`). As with configmaps, we can specify the exact name of the key that we want to use or just pass the whole secret. You can pick one of them
<pre><code>
spec:
  containers:
    - name: bookinfo-recommendations
      image: marianstanciu15/bookinfo-recommendations:2.0
      <b>env:
        - name: LIBRARIAN_NAME
          valueFrom:
            secretKeyRef:
              name: librarian-secret
              key: LIBRARIAN_NAME</b>
</code></pre>
or
<pre><code>
    spec:
      containers:
      - name: bookinfo-recommendations
        image: marianstanciu15/bookinfo-recommendations:2.0
        <b>envFrom:
          - secretRef:
              name: librarian-secret</b>
</code></pre>

Let's test it: 

<pre><code>
$ kubectl apply -f bookinfo-kubernetes
$ kubectl get pods
$ kubectl logs bookinfo-recommendations-749d5b4fdf-qwwxf

> bookinfo-recommendations@1.0.0 start /usr/src/bookinfo-recommendations
> node index.js

<b>Hello! My name is John</b>
</code></pre>

**3. Create a secret to pull images from a private registry**  
Let's use a special kind of secret in Kubernetes. We will use this secret to pull images from a registry. The registry from which we've pulling images until now is public but we can still use a secret to access  it. 

We can use the kubectl. We must specify the secret type: `docker-registry` and the information about the registry: 
<pre><code>
kubectl create secret docker-registry my-registry-secret --docker-server=https://index.docker.io/v1/ --docker-username=<i>your_username</i> --docker-password=<i>your_password</i>
</code></pre>
Notice the `docker-registry` option here. That is the secret type, a special Secret type built-in into Kubernetes.
`https://index.docker.io/v1/ ` is the server name for DockerHub. 

```
kubectl get secrets
```
You can see a secret called `my-registry-secret` of type `kubernetes.io/dockerconfigjson`

We can use this secret to pull images by specifying it in the deployment template spec as a `imagePullSecrets`. Notice that this property is at the same level with `containers` so all containers will be pulled using this secret.   
`bookinfo-recommendations-deployment.yaml`
<pre><code>
...
    spec:
      containers:
      - name: bookinfo-recommendations
        image: marianstanciu15/bookinfo-recommendations:2.0
        envFrom:
          - secretRef:
                name: librarian-secret
      <b>imagePullSecrets: 
        - name: my-registry-secret</b>
...
</code></pre>

<pre><code>
kubectl apply -f bookinfo-kubernetes
</code></pre>

You can read more about Secrets [here](https://kubernetes.io/docs/concepts/configuration/secret/#)

### VII Namespaces, probes, Quality of Service and more

**1. Namespaces**  
You can split your cluster in multiple, virtual clusters called namespaces. 
This way you can divide your cluster between multiple teams, applications or multiple environments (dev, test, uat, prod). 

All objects in Kubernetes exist in a namespace. 
By default Kubernetes has 3 namespaces: 
  * _default_ -  all Kubernetes requests we make(get, create, apply), by default are executed in this namespace 
  * _kube-system_ - the namespace for objects created by the Kubernetes system
  * _kube-admin_ - as a convention, all objects that are used by the entire cluster reside in this namespace(ex: configurations for the dns resolver)

We can see this in our cluster too:
<pre><code>
$ kubectl get namespaces
NAME                   STATUS   AGE
<b>default                Active   4d2h</b>
<b>kube-public            Active   4d2h</b>
<b>kube-system            Active   4d2h</b>
kubernetes-dashboard   Active   19h
</code></pre>

We can create our own namespaces:
Create a `bookinfo-namespace.yaml`:
<pre><code>
apiVersion: v1
kind: Namespace
metadata:
  name: bookinfo-ns
</code></pre>

We just have to specify the namespace name. 

```
$ kubectl apply -f bookinfo-kubernetes/bookinfo-namespace.yaml
$ kubectl get namespaces

NAME                   STATUS   AGE
bookinfo-ns            Active   32s
...
```
We could also use this command without creating a yaml  file:
```
kubectl create namespace bookinfo-ns
```

So far, all of our objects were created in the `default namespace`. Let's move everything in the `bookinfo-ns` namespace. We will begin with `bookinfo-recommendations`. 
<pre><code>
kubectl apply -f bookinfo-kubernetes/bookinfo-recommendations-deployment.yaml <b>-n bookinfo-ns</b>
</code></pre>

Notice the `-n bookinfo-ns` at the end. We can specify the target namespace with every request we make(apply, create, delete, get, etc). By default, the target namespace is `default`

Let's see the objects in the `bookinfo-ns`
<pre><code>
$ kubectl get all -n bookinfo-ns
NAME                                            READY   STATUS                       RESTARTS   AGE
pod/bookinfo-recommendations-5565f78cbb-nb9pv   0/1     CreateContainerConfigError   0          108s
pod/bookinfo-recommendations-5565f78cbb-njtxw   0/1     CreateContainerConfigError   0          108s

NAME                                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/bookinfo-recommendations   0/2     2            0           108s

NAME                                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/bookinfo-recommendations-5565f78cbb   2         2         0       108s
</code></pre>

We now have deployed `bookinfo-recommendations` in two separate namespaces.
Let's apply the entire configuration to the new namespace. For this we need to add a `namespace` property to the `metadata` of all our objects
<pre><code>
metadata:
  ...
  <b>namespace: bookinfo-ns</b>
  ...
</code></pre>

```
kubectl apply -f bookinfo-kubernetes
# notice we don't specify the namespace here, because we set the namespace in the metadata, Kubernetes will use that as the target namespace 
```

```
$ kubectl get all -n bookinfo-ns
NAME                                            READY   STATUS    RESTARTS   AGE
pod/bookinfo-recommendations-5565f78cbb-nb9pv   1/1     Running   0          12m
pod/bookinfo-recommendations-5565f78cbb-njtxw   1/1     Running   0          12m
pod/bookinfo-ui-594dc5dccd-p4c97                1/1     Running   0          2m6s

NAME                               TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
service/bookinfo-recommendations   ClusterIP   10.100.137.163   <none>        3000/TCP       2m6s
service/bookinfo-ui                NodePort    10.108.208.109   <none>        80:31623/TCP   2m6s

NAME                                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/bookinfo-recommendations   2/2     2            2           12m
deployment.apps/bookinfo-ui                1/1     1            1           2m6s

NAME                                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/bookinfo-recommendations-5565f78cbb   2         2         2       12m
replicaset.apps/bookinfo-ui-594dc5dccd                1         1         1       2m6s
```

We have our application deployed in a separate namespace and our services were created here too. So how does Kubernetes knows to resolve the right services IP when we call them by name, because we now have 2 services with the same name, but in different namespaces? 

When  we create a service a new DNS entry is created. This entry is of the form <code>**_service-name_**.**_namespace-name_**.svc.cluster.local</code> . This is the fully qualified domain name(FQDN) but we can use the simple name which is just the **_service-name_**. In this case the name will be resolved in the same namespace. This also means that we can reach services in different namespaces by using the FQDN.

We can also change the default target namespace with this command:
```
kubectl config set-context --current --namespace=bookinfo-ns
```

We can delete now all the objects in the default namespace. When you delete a namespace you delete all the objects in it, but in this case we don't actually want to delete the `default` namespace, just the objects in it. 
```
kubectl delete all --all -n default
```

To delete a namespace you can use
<pre><code>
kubectl delete namespace <b>namespace-you-want-to-delete</b> 
</code></pre>

**2. Configure Liveness, Startup and Readiness Probes**  

We saw in chapter 2 that Kubernetes watches our applications, if one of them goes down it will restart it. Kubernetes takes the decision of restarting the application on a liveliness condition, which by default is: `Is the main process in the container still running`? 
This is ok for most cases, but sometimes an application can still be running and not working properly.   

Kubernetes has a way of defining a `liveliness probe` to check the status of each application. 
The liveliness test can be a command to execute in the container, a HTTP request to our pod or we can try to open a new TCP connection with the pod. 

In our `bookinfo-recommendations` we have a endpoint 'recommendations-app/health' which can tell us if the application is still running properly, so we will be using the HTTP liveliness probe. 

We have to modify our `bookinfo-recommendations-deployment.yaml` in order to add the `liveliness probe`. 

<pre><code>
....
    spec:
      containers:
      - name: bookinfo-recommendations
        image: marianstanciu15/bookinfo-recommendations:2.0
        imagePullPolicy: Always
        envFrom:
          - secretRef:
                name: librarian-secret
        <b>livenessProbe:
          httpGet:
            path: /recommendations-app/health
            port: 3000
          initialDelaySeconds: 3
          periodSeconds: 3
          failureThreshold: 3</b>
      imagePullSecrets: 
        - name: my-registry-secret
....
</code></pre>

We add a **`livenessProbe`** object to our container.   
**`httpGet`** - is the type of probe, we use `exec` to just execute  a command in the container and `tcpSocket` for the TCP test.   
**`path`** - the path were the request will be made
**`port`** - the port were the request will be made
**`initialDelaySeconds`** - specifies how many seconds should Kubernetes to wait before running this probe, some applications might start slower
**`periodSeconds`** - how often to test this probe. In this case Kubernetes will test this pod every 3 seconds. 
**`failureThreshold`** - after how many failed tests should Kubernetes restart the container

For the HTTP test, a response code greater or equal to 200 and less than 400 means everything is ok. 

Getting the `initialDelaySeconds` right is pretty hard, especially with older applications that can take some time to start. You might either set a period that is not long enough for the application to start up, ending up with a liveliness probe that is always failing or you could set a period that is too long and the liveliness probe will not start until that period is over. 

What we want is to set a maximum period for our application to start, but if it starts faster than that the liveliness probe should kick in. 


 For this problem the `startup probe` was introduced that does just that. No other probe is executed until this one either exceeds the time limit or gets a OK response. This is way more flexible than just settings a `initialDelaySeconds`
The configuration is similar to the `livelinessProbe` object, the only difference being that there is no `initialDelaySeconds` in neither of the probes now. 
<pre><code>
    spec:
      containers:
      - name: bookinfo-recommendations
        image: marianstanciu15/bookinfo-recommendations:2.0
        imagePullPolicy: Always
        envFrom:
          - secretRef:
                name: librarian-secret
        livenessProbe:
          httpGet:
            path: /recommendations-app/health
            port: 3000
          <strike>initialDelaySeconds: 3</strike>
          periodSeconds: 3
          failureThreshold: 3
        <b>startupProbe:
          httpGet:
            path: /recommendations-app/health
            port: 3000
          periodSeconds: 3
          failureThreshold: 30</b>
      imagePullSecrets: 
        - name: my-registry-secret
</code></pre>

The `initialDelaySeconds` is now actually `failureThreshold` * `periodSeconds`, in this case that means 3 * 30 = 90sec. If our application starts faster than that the liveliness probe kicks in. 

There is another type of probe in Kubernetes, called a `readiness probe`. This probe covers the case when the application started, it can answer to the health requests but is not really ready to receive traffic. Maybe it has to load some configuration first, load a big file into memory or make an external request on startup. 

This is very similar to the other probes and this one too will not start until the `startup probe` is not finished. A pod that fails this probe will not be restarted, but it will no longer receive traffic from a Kubernetes Service(if we have one) and it's status will change to UNREADY. Kubernetes will keep probing the container until is READY again. 

Let's add this probe too. Usually you want a different test than the one for the `liveliness probe` but in this case we will use the same endpoint:
<pre><code>
...
    spec:
      containers:
      - name: bookinfo-recommendations
        image: marianstanciu15/bookinfo-recommendations:2.0
        envFrom:
          - secretRef:
                name: librarian-secret
        livenessProbe:
          httpGet:
            path: /recommendations-app/health
            port: 3000
          periodSeconds: 3
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /recommendations-app/health
            port: 3000
          periodSeconds: 3
          failureThreshold: 3
        <b>readinessProbe:
          httpGet:
            path: /recommendations-app/health
            port: 3000
          periodSeconds: 3
          failureThreshold: 3</b>
....
</code></pre>

Now we can apply the new configuration:
```
kubectl apply -f bookinfo-kubernetes
```

We can use `describe` on one of the pods to see if the probes were added to our pods. 
<pre><code>
$ kubectl describe pod bookinfo-recommendations-84fc9b5b6-2cmns
....
Containers:
  bookinfo-recommendations:
    Container ID:   docker://49650f113bebb9688c204a67f0a0f407600e6b7cacaa5e7304ca29bd83457afc
    ...
    State:          Running
      Started:      Mon, 25 May 2020 21:21:51 +0300
    Ready:          True
    Restart Count:  0
    <b>Liveness:       http-get http://:3000/recommendations-app/health delay=0s timeout=1s period=3s #success=1 #failure=3
    Readiness:      http-get http://:3000/recommendations-app/health delay=0s timeout=1s period=3s #success=1 #failure=3
    Startup:        http-get http://:3000/recommendations-app/health delay=0s timeout=1s period=3s #success=1 #failure=3</b>
....
</code></pre>

You can read more aboute `Probes` [here](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes).

**3. Quality of Service**