## Flowchart Overview

#### Start
Customer Arrives
- Add customer to the queue (max 10).

Is the Queue Full?
- If yes, wait for a customer to be served.
- If no, proceed to the next step.

Serve First Customer in Queue
- Customer Chooses Car
- Check if the preferred car brand is available.

Is Preferred Car Available?
- If yes, move customer to that car.
- If no, show available brands and allow customer to choose another.

Customer in Car
- Move to Cashier or Exit.

At Cashier
- Ask: "Would you like to purchase the car?"

Customer Response
- If "YES":
            Mark car as "SOLD".
            Update statistics (customers served, cars sold, total amount).
            Remove customer from the application.

- If "NO":
            Remove customer from the application.
            Update statistics (customers served).

At Exit
- Remove customer from the application without updating statistics.
End
