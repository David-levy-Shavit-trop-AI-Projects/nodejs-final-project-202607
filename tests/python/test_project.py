import requests
import sys

filename = sys.argv[1] if len(sys.argv) > 1 else "test_project_output.txt"

# The first will handle the logs. (a)
# The second will handle all user-related tasks. (b)
# The third will handle all cost-related tasks. (c)
# The fourth will handle any admin-related tasks (e.g. developers details) (d)

a = "http://localhost:3001"
b = "http://localhost:3002"
c = "http://localhost:3003"
d = "http://localhost:3004"

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
    url = c + "/api/report/?id=123123&year=2026&month=8"
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
print("testing getting all users")
print("--------------------------")

try:
    url = b + "/api/users/"
    data = requests.get(url)

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)

except Exception as e:
    print("problem")
    print(e)

print("")

print()
print("testing getting a specific user")
print("--------------------------------")

try:
    url = b + "/api/users/123123"
    data = requests.get(url)

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)

except Exception as e:
    print("problem")
    print(e)

print("")

print()
print("testing adding a user")
print("----------------------")

try:
    url = b + "/api/add/"
    data = requests.post(
        url,
        json={
            "id": 555555,
            "first_name": "test",
            "last_name": "user",
            "birthday": "2000-01-01"
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
print("testing adding a duplicate user (should error)")
print("------------------------------------------------")

try:
    url = b + "/api/add/"
    data = requests.post(
        url,
        json={
            "id": 555555,
            "first_name": "test",
            "last_name": "user",
            "birthday": "2000-01-01"
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
print("testing getting all logs")
print("--------------------------")

try:
    url = a + "/api/logs/"
    data = requests.get(url)

    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)

except Exception as e:
    print("problem")
    print(e)

print("")

output.close()
sys.stdout = sys.__stdout__
print("Done. See " + filename)
