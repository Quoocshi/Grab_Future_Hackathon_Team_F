# TÊN APP

## 1. Problem

- With an average salary of just **325,000 VND/day**, Vietnamese workers spend up to **15% to 25% of their daily income** on a single solo ride (**50,000 to 80,000 VND**). This cost makes daily ride-hailing completely unaffordable for the average commuter.

- Ho Chi Minh City’s severe road density (**2.38 km/km²**) triggers heavy daily traffic jams that choke the entire metro area. This is a primary driver of the city's air pollution, dumping **13 million tons of CO₂** into the atmosphere annually.


## 2. What is our Solution?

Our solution is a **ridesharing platform** acting as an intermediary service layer that connects ride-hailing apps like: Grab, Be, Xanh SM, Tada,...

Impact

- Minimize the number of single-passenger vehicles on the road, cutting down traffic jams and lowering traffic-related CO₂ emissions.

- Foster a cultural shift from the habit of solo riding and replace it with a **hub-based riding style** that contributes to a healthier, eco-conscious urban community.


## 3. How it Addresses the Problems

### For Customers

- We solve the customer’s biggest mobility pain point: **affordable rides during peak demand**. By grouping passengers with similar routes, one expensive solo ride becomes **40–60% cheaper**.
#### Ridesharing Pricing Formula

$$
Fare_{share}=\frac{Fare_{solo}\times(1+\lambda)}{N}
$$

Where:

- $Fare_{share}$: the amount each passenger pays when sharing a ride
- $Fare_{solo}$: the fare of the trip if a passenger travels alone
- $N$: the number of passengers sharing the same ride
- $\lambda$: platform fee + risk compensation factor (e.g., 0.2 = 20%)


#### Discount Rate Formula

$$
Discount(N)=1-\frac{1+\lambda}{N}
$$

Where:

- $Discount(N)$: the discount percentage applied to each passenger
- $N$: the number of passengers in the shared ride
- $\lambda$: the system maintenance factor


### For the Urban Environment

- Remove unnecessary solo-passenger cars to reduce pressure on HCMC's severely limited road networks.

- Reduce curbside chaos by moving pickups from random crowded spots to optimized urban hubs, especially around:

  - Offices
  - Schools
  - Malls
  - Hospitals
  - Transit stations

- Ridesplitting reduces the emission factors per ride-km of ridesourcing by **28.7–32.5% on average**.


# 4. How it Works

## Step 1: Create or Join a "Room"

When someone wants to travel:

- Press the **"Join Room"** button.
- The app scans the surrounding area.
- If someone is already heading the same way, they can join the existing **Room**.

If no matching trip exists:

- Press **"Create Room"**.
- Become the **Host**.
- Start a new Room that other passengers can join.


## Step 2: Hub-based Routing (No Door-to-Door)

To avoid forcing drivers to pick up individual passengers:

- The app optimizes routes and creates pickup stations called **Hubs**.
- Passengers walk a short distance to their assigned Hub to catch the ride.
- After drop-off, passengers walk from the Hub to their destination.


## Step 3: Price Aggregator

The platform automatically:

- Compares prices across different ride-hailing apps.
- Bundles groups of customers together.
- Allows users to choose the cheapest available option.


## Step 4: Penalty System

To prevent users from disrupting shared rides:

- A strict penalty system or pre-payment mechanism is enforced.
- Users are charged if they cancel after joining a group.
