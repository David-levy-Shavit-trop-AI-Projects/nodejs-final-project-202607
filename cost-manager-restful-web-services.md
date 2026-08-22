# Cost Manager RESTful Web Services

**Final Project in Asynchronous Server-Side Development Course**

The final project includes developing significant parts of RESTful Web Services that allow the development of the front end (client).

## Database

The database should be a MongoDB database (using the MongoDB Atlas service). The data should be organized in collections that, at a minimum, include the `users`, the `costs`, and the `logs` collections. The use of MongoDB should implement the **Computed Design Pattern**.

The database should support organizing costs by category. The following categories must be supported:

- `food`
- `health`
- `housing`
- `sports`
- `education`

### Users Collection

The `users` collection should hold documents that, at a minimum, include:

- `id`
- `first_name`
- `last_name`
- `birthday`

The `id` and `_id` are two different properties. Do not mix them.

When creating the schema for working with Mongoose, use the following types:

| Property | Type |
|---|---|
| `id` | Number |
| `first_name` | String |
| `last_name` | String |
| `birthday` | Date |

### Costs Collection

The `costs` collection should hold documents that, at a minimum, include:

- `description`
- `category`
- `userid`
- `sum`

When creating the schema for working with Mongoose, use the following types:

| Property | Type |
|---|---|
| `description` | String |
| `category` | String |
| `userid` | Number |
| `sum` | Double |

---

# Application

The application should be developed using **Express.js**, **Mongoose**, and **Pino**, and it must be developed in **JavaScript**. TypeScript cannot be used.

The application should work as RESTful Web Services and include the following endpoints.

## Adding Cost Items

It should be possible to send an HTTP `POST` request to add a new cost item.

### Request

The parameters that should be sent to the server, at a minimum, are:

- `description`
- `category`
- `userid`
- `sum`

### Response

The response should be a JSON document that describes the new cost item that was added.

The names of the parameters and the names of the properties in the JSON response should be the same as the names of the properties of the documents added to the `costs` collection.

If the date and time at which the cost item was created are not passed to the server, the server should use the date and time at which the request was received.

If an error occurs, a JSON document describing the error should be returned.

If adding the cost item succeeds, a JSON document describing the added cost item should be returned.

**Endpoint:**

```text
/api/add
```

---

## Getting Monthly Report

It should be possible to send an HTTP `GET` request that includes, as part of the query string, the ID of the specific user for whom we want to get a JSON document describing all cost items in a specific month and year.

### Query Parameters

- `id`
- `year`
- `month`

The response should be a JSON document listing all cost items for the specified user, month, and year.

The costs should be grouped according to their categories.

Each cost should be described using:

- `sum`
- `day` — the day of the month
- `description`

The names of the parameters and properties in the JSON response should be the same as the names used in the `costs` collection.

If an error occurs, a JSON document describing the error should be returned.

**Endpoint:**

```text
/api/report
```

### Computed Design Pattern

The code responsible for generating the monthly report must implement the **Computed Design Pattern**.

When a report is requested for a month that has already passed, that report should be saved for future requests.

The server side does not allow adding costs with dates that belong to the past.

### Required Report Format

The JSON returned by the project should have the following structure.

A category without any cost items must still be mentioned in the report. For example, `health` and `housing` appear below even though they do not contain any costs.

```json
{
  "userid": 123123,
  "year": 2025,
  "month": 11,
  "costs": [
    {
      "food": [
        {
          "sum": 12,
          "description": "choco",
          "day": 17
        },
        {
          "sum": 14,
          "description": "baigale",
          "day": 22
        }
      ]
    },
    {
      "education": [
        {
          "sum": 82,
          "description": "math book",
          "day": 10
        },
        {
          "sum": 112,
          "description": "java book",
          "day": 12
        },
        {
          "sum": 182,
          "description": "dictionary",
          "day": 22
        }
      ]
    },
    {
      "health": []
    },
    {
      "housing": []
    },
    {
      "Sport": []
    }
  ]
}
```

---

## Getting the Details of a Specific User

It should be possible to send an HTTP `GET` request to get the details of a specific user.

The user ID will be sent as part of the URL.

The response should be JSON and include:

- `first_name`
- `last_name`
- `id`
- `total`

`total` represents the total costs of that specific user.

If an error occurs, a JSON document describing the error should be returned.

**Example endpoint:**

```text
/api/users/123123
```

---

## Developers Team

It should be possible to send an HTTP `GET` request to get a JSON document describing the team members (the students who developed the project).

The names of the properties of this JSON document should be the same names used in the `users` collection.

These names should **not** be stored in the database. This would be a problem because the submitted project must have an empty database except for a single imaginary user.

The team members' names can be:

- Hardcoded in the code, or
- Stored in the `.env` file.

The JSON document should include only the first and last names of each team member.

No additional data should be included.

If an error occurs, a JSON document describing the error should be returned.

**Endpoint:**

```text
/api/about
```

---

## List of Users

It should be possible to send an HTTP `GET` request to get a JSON document describing all users.

The names of the properties in the JSON response should be the same as the names of the properties used in the `users` collection.

If an error occurs, a JSON document describing the error should be returned.

**Endpoint:**

```text
/api/users
```

---

## List of Logs

It should be possible to send an HTTP `GET` request to get a JSON document describing all logs.

The names of the properties in the JSON response should be the same as the names of the properties used in the `logs` collection.

If an error occurs, a JSON document describing the error should be returned.

**Endpoint:**

```text
/api/logs
```

---

## Adding User

It should be possible to send an HTTP `POST` request to add a new user.

### Request Parameters

At a minimum:

- `id`
- `first_name`
- `last_name`
- `birthday`

### Response

The response should be a JSON document describing the new user that was added.

The names of the parameters and the names of the properties in the JSON response should be the same as those used in the `users` collection.

If an error occurs, a JSON document describing the error should be returned.

If adding the user succeeds, a JSON document describing the added user should be returned.

The database cannot contain more than one document describing the same user.

If there is an attempt to add a user that already exists in the `users` collection, an error must occur and a JSON document describing that error should be returned to the client.

**Endpoint:**

```text
/api/add
```

---

## Error Message

When a JSON document describing an error is returned from the server, it should include, at a minimum:

- `id`
- `message`

Example:

```json
{
  "id": 400,
  "message": "Error description"
}
```

---

## RESTful Web Services Verification

You should verify that the RESTful Web Services work as expected by running the test program included in the final project document.

Make sure the code that works with MongoDB is placed inside a separate folder named:

```text
models
```

This follows the structure learned in class.

---

# Log Messages

Use the **Pino** library for creating log messages that will be saved to the MongoDB database.

A log message should be written to the database:

1. For every HTTP request received by the server side.
2. Whenever an endpoint is accessed.

---

# The `.env` File

The project should include the use of a `.env` file as explained in class.

The `.env` file may be used for configuration such as:

- MongoDB connection string
- Port numbers
- Team member information
- Other environment-specific configuration

Do not commit sensitive credentials to source control.

---

# Four Processes

The project must include **four separate processes (microservices)**.

The processes should be divided as follows:

| Process | Responsibility |
|---|---|
| 1 | Admin — Getting Logs |
| 2 | User-related tasks — Getting User Details, Adding User, List of Users |
| 3 | Cost-related operations — Adding Cost Item, Getting Monthly Report |
| 4 | Admin-related operations — Developers Team |

There are multiple ways to implement four separate processes.

The simplest approach would probably be to develop four separate projects and deploy each one separately.

When completing the project submission form, you will need to provide **four different URL addresses**, one for each process.

### Ports

If the four processes are deployed on the same server, they must use different ports.

Several processes on the same computer cannot use the same port.

If the four processes are deployed on separate servers, they may use the same port.

### Important

Developing one project with four routes, where each route handles a separate collection of endpoints, **does not fulfill the requirement** for four separate processes.

---

# Unit Tests

You should develop detailed unit tests for each endpoint.

You may choose:

- The programming language
- The testing libraries

used for the unit tests.

---

# Code Style

The JavaScript code should follow the guidelines listed in the **Professional JavaScript Guide** book.

Make sure to add comments.

Follow the course message board for information about obtaining the book for free.

Reference:

[Professional JavaScript Style Guide](https://www.amazon.com/Professional-JavaScript-Style-Guide-Maintainable-ebook/dp/B0GK11M6NW/ref=sr_1_2)

---

# Deployment

You should deploy the final project on a server (or servers) connected to the web.

Each microservice must be implemented as a separate process.

Do not forget to fill in the submission form with the URL addresses of the four microservices.

---

# Submission Deadline

The deadline for submitting the final project will be published on the course message board.

---

# Submission Guidelines

Carefully follow the submission guidelines below.

If a question arises, post it to the course forum to receive a detailed and accurate answer.

Points will be deducted when the submission does not meet the requirements. For example, if the submitted PDF is not properly organized to allow code review, points will be deducted.

## 1. Project Video

Create a short video, preferably up to **60 seconds**, showing how the project runs.

Upload the video to YouTube as an **unlisted** video.

---

## 2. Project ZIP

Pack the entire project, including the testing code, into a ZIP file.

Upload the ZIP file together with the PDF file to the submission box on Moodle.

It is highly recommended that you delete the `node_modules` folder before creating the ZIP file. Otherwise, the ZIP file may be too large to upload to Moodle.

You should upload exactly these two files:

1. ZIP file
2. PDF file

Do not pack them together into another ZIP file.

---

## 3. PDF Filename

Create a PDF file.

Its filename should include the first name and last name of the team manager, separated by `_`.

Example:

```text
moshe_israeli.pdf
```

The filename should contain lowercase letters only.

---

## 4. PDF Contents

The PDF must include the following information at the beginning:

### a. Team Manager

The first and last names of the development team manager.

### b. Team Members

For each team member:

- First name
- Last name
- ID
- Mobile number
- Email address

### c. Project Video

A clickable link to the video created in item 1.

The PDF may also include additional information that would normally be included in a `README.txt` file.

### d. Collaborative Tools

Include a summary of the use made of **at least two collaborative tools**.

The summary should be no more than **100 words**.

### e. Source Code

The PDF must include the source code of all files written for the project.

Requirements:

- Include the name of each file next to its code.
- Make sure lines are not broken.
- Organize the PDF properly to allow code review.
- Include all JavaScript code written for the project.
- The code in each file must be preceded by the filename.

---

## 5. Submission on Moodle

Only the **team manager** should submit the project.

Other students do not need to submit it.

The team manager should submit:

- PDF file
- ZIP file

to the assignment box on Moodle.

### Important Submission Rules

- Pay attention to the time difference between the Moodle server and your local time.
- Treat the deadline published on Moodle as if it were **30 minutes earlier**.
- Late submissions will not be accepted.
- Projects developed by a single student will not be accepted.
- Projects developed by students from different groups will not be accepted.
- A delay cannot normally be requested.
- Teams with justified reasons for a delay, according to college guidelines, will be handled separately.
- Such teams should not submit through the regular assignment box.
- Such teams will not necessarily receive their grade along with the other teams.

---

## 6. Microservice URLs

Fill out the required form with the URL addresses that can be used to test the project after it has been deployed online.

The form URL will be provided by the course.

You must provide four URLs:

1. Logs microservice
2. Users microservice
3. Costs microservice
4. Developers/Admin microservice

---

## 7. Initial Database State

When submitting the project, the database should be empty except for a single imaginary user in the `users` collection.

The user must have:

```text
id: 123123
first_name: mosh
last_name: israeli
```

---

## 8. Teamwork Assessment

The project will be carried out in teams of **two students**.

The project includes a **10% teamwork assessment** using the collaborative tools presented during the course.

A student who submits the project alone will lose **10%** of the project grade.

Students who submit alone automatically lose 10% of the project grade.

When submitting the project, it is not possible to get a delay.

Students who do not submit on time will lose **2 points for every hour of delay**.

---

# Code for Testing the Project

The following code is only a **sample** that can be used to test the final project.

During the actual grading of the final project, a different but similar test program will be used.

You are expected to test your final project before submitting it using the code below.

Do not forget to complete the missing URL addresses assigned to variables `a`, `b`, `c`, and `d`, as explained in class.

### Microservice Variables

- `a` — Logs microservice
- `b` — User-related microservice
- `c` — Cost-related microservice
- `d` — Admin-related microservice / Developers Team

## Sample Test Code

```python
import requests
import sys

filename = input("filename=")

# The first will handle the logs. (a)
# The second will handle all user-related tasks. (b)
# The third will handle all cost-related tasks. (c)
# The fourth will handle any admin-related tasks (e.g. developers details) (d)

a = "______________________________"
b = "______________________________"
c = "______________________________"
d = "______________________________"

output = open(filename, "w")
sys.stdout = output

print("a=" + a)
print("b=" + b)
print("c=" + c)
print("d=" + d)
print()

print("testing getting the about")
print("-------------------------")

try:
    text = ""

    # getting details of team manager
    url = d + "/api/about/"
    data = requests.get(url)

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)
    print(data.json())

except Exception as e:
    print("problem")
    print(e)

print("")

print()
print("testing getting the report - 1")
print("------------------------------")

try:
    text = ""

    # getting the report
    url = c + "/api/report/?id=123123&year=2026&month=1"
    data = requests.get(url)

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)
    print(text)

except Exception as e:
    print("problem")
    print(e)

print("")

print()
print("testing adding cost item")
print("----------------------------------")

try:
    text = ""

    url = c + "/api/add/"
    data = requests.post(
        url,
        json={
            "userid": 123123,
            "description": "milk 9",
            "category": "food",
            "sum": 8
        }
    )

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)

except Exception as e:
    print("problem")
    print(e)

print("")

print()
print("testing getting the report - 2")
print("------------------------------")

try:
    text = ""

    # getting the report
    url = c + "/api/report/?id=123123&year=2026&month=5"
    data = requests.get(url)

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)
    print(text)

except Exception as e:
    print("problem")
    print(e)

print("")
```

---

# Quick Requirements Checklist

## Database

- [ ] MongoDB Atlas is used.
- [ ] `users` collection exists.
- [ ] `costs` collection exists.
- [ ] `logs` collection exists.
- [ ] Computed Design Pattern is implemented.
- [ ] Required cost categories are supported.
- [ ] Mongoose schemas use the required types.
- [ ] `id` and MongoDB `_id` are kept as separate properties.

## Application

- [ ] Express.js is used.
- [ ] Mongoose is used.
- [ ] Pino is used.
- [ ] JavaScript is used instead of TypeScript.
- [ ] `.env` is used.
- [ ] MongoDB code is located under `models/`.
- [ ] Error responses contain `id` and `message`.

## Endpoints

- [ ] `POST /api/add` — add cost item.
- [ ] `GET /api/report` — monthly report.
- [ ] `GET /api/users/:id` — user details.
- [ ] `GET /api/about` — developers team.
- [ ] `GET /api/users` — list users.
- [ ] `GET /api/logs` — list logs.
- [ ] `POST /api/add` — add user, according to the required user-service process.

> **Important:** The specification uses `/api/add` for both adding a cost item and adding a user. Because these operations must be handled by different microservices, the service/port determines which operation receives the request.

## Microservices

- [ ] Four separate processes are implemented.
- [ ] Logs service is separate.
- [ ] Users service is separate.
- [ ] Costs service is separate.
- [ ] Developers/Admin service is separate.
- [ ] Each service has its own deployment URL.
- [ ] Services on the same server use different ports.

## Testing

- [ ] Detailed unit tests exist for every endpoint.
- [ ] The provided sample test program was executed successfully.
- [ ] The four service URLs were tested.

## Deployment

- [ ] All four microservices are deployed online.
- [ ] Four URLs are ready for submission.
- [ ] Database is empty except for the required imaginary user.

## Submission

- [ ] 60-second-or-less demo video created.
- [ ] Video uploaded to YouTube as unlisted.
- [ ] Project ZIP created.
- [ ] `node_modules` removed from ZIP.
- [ ] PDF created.
- [ ] PDF filename follows the required format.
- [ ] Team manager information included.
- [ ] All team member information included.
- [ ] Clickable video link included.
- [ ] Collaborative tools summary is no more than 100 words.
- [ ] All source code is included in the PDF.
- [ ] Each source file is clearly named before its code.
- [ ] Only the team manager submits the project.
