# Nexoar: Decentralized Options Trading Protocol

Nexoar is a decentralized application for options trading on Stacks, featuring robust liquidity management. Users can provide liquidity to earn fees, and our locked liquidity mechanism ensures payouts are secure and predictable. The protocol includes a comprehensive, on-chain premium calculation logic designed for efficiency and transparency.

## On-Chain Options Pricing: Rationale and Approach

Traditional options pricing models like Black-Scholes are mathematically complex and computationally expensive for on-chain execution. Nexoar’s formula is engineered to closely mimic Black-Scholes behavior while remaining practical for smart contracts. This approach balances accuracy and performance, enabling real-time, decentralized options pricing without the heavy resource demands of floating-point math and advanced functions.

Below is a comparison between the Black-Scholes model and Nexoar’s on-chain formula:


## Premium Calculation Logic

### 1. Intrinsic Value

$$
\text{Intrinsic} =
\begin{cases}
\max(\text{spot} - \text{strike},\ 0) & \text{if call} \\\\
\max(\text{strike} - \text{spot},\ 0) & \text{if put}
\end{cases}
$$

### 2. Time Value

$$
\text{TimeValue} =
\underbrace{
\frac{\text{strike} \cdot \sigma \cdot \sqrt{T} \cdot C}{1}
}_{\text{ATM time value}}
\cdot
\underbrace{
\max\left(0,\ 1 - \frac{\text{moneyness\_pct}}{D_{\text{max}}}\right)
}_{\text{moneyness decay}}
$$

Where:

- $\sigma = 0.80$ (annualized volatility, 80%)
- $T = \frac{\text{duration\_days}}{365}$
- $C = 0.496$ (time value coefficient)
- $\text{moneyness\_pct} = \frac{|\text{spot} - \text{strike}|}{\text{strike}}$
- $D_{\text{max}} = 1.0$ (max moneyness distance, 100%)

### 3. Total Premium
$$
\text{Premium} = \text{Intrinsic} + \text{TimeValue}
$$

### Try It Out

Experience Nexoar live:

[Try it out here](PLACE_YOUR_LINK_HERE)
