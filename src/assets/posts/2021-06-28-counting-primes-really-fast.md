---
id: counting-primes-really-fast
title: Counting Primes Really Fast
date: 2021-06-28
tags: [Mathematics, Rust]
image:
    src: /assets/img/2021-06-28-counting-primes-really-fast/chalkboard.jpg
    alt: Chalkboard
---

Suppose you are given a very large number, for example $n = 10^{12}$, and you wish to know how many numbers equal to or less than $n$ are prime. This is the prime counting function, normally denotes as $\pi(n)$. In this article we will explore some of the methods to efficiently calculate $\pi(n)$, and we will benchmark each in Rust.

# Checking every number up to $n$ for primality

Let's write a naive implementation that we will use as a baseline. Of course, the first approach would be to test the primality of each number from $2$ to $n$. First, let's write a naive implementation for `is_prime`:

```rust
fn is_prime(x: usize) -> bool {
    for d in 2..x {
        if x % d == 0 {
            return false;
        }
    }

    return true;
}
```

Now, counting primes is as simple as iterating over the numbers that can be prime and testing each one:

```rust
pub fn count(n: usize) -> usize {
    let mut result = 0;

    for x in 2..(n + 1) {
        if is_prime(x) {
            result += 1;
        }
    }

    return result;
}
```

As you might expect, this function does terribly:

```txt
Begun testing the naive implementation with n = 10^5.
The amount of prime numbers that are less than or equal to 10^5 is 9592.
Elapsed: 1.03s
Finished testing the naive implementation with n = 10^5.
```

I couldn't even get it to finish calculating $n = 10^6$ in under a minute.

# Using the Sieve of Eratosthenes

A better option than the naive implementation is the Sieve of Eratosthenes. There is a nice graphic on its [Wikipedia entry](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes) explaining how it works, so I won't go into detail. First of all, note that it is clearly faster than checking each prime as the operations are simpler (just addition and multiplication instead of the modulus operator). The problem with this algorithm is that you would need a flag for each number to indicate whether it is prime or not. For large enough $n$ this is untenable, as you will soon run out of memory, or the memory will take too long to allocate. Still, you could use the Sieve of Eratosthenes to rapidly compute the primes up to a given limit.

A naive implementation of the sieve in Rust looks like:

```rust
pub fn count(n: usize) -> usize {
    let mut result = 0;

    let mut flags = Vec::with_capacity(n);
    for _ in 0..n {
        flags.push(true);
    }
    flags[0] = false;

    for i in 0..n {
        if flags[i] {
            let x = i + 1;
            for m in ((i + x)..n).step_by(x) {
                flags[m] = false;
            }
            result += 1;
        }
    }

    return result;
}
```

A benchmark using $n = 10^6$ proves this function to be much faster than the naive implementation:

```txt
Begun testing the sieve implementation with n = 10^6.
The amount of prime numbers that are less than or equal to 10^6 is 78498.
Elapsed: 6.86ms
Finished testing the sieve implementation with n = 10^6.
```

Sadly, it starts to falters at around $n = 10^9$:

```txt
Begun testing the sieve implementation with n = 10^9.
The amount of prime numbers that are less than or equal to 10^9 is 50847534.
Elapsed: 16.53s
Finished testing the sieve implementation with n = 10^9.
```

I couldn't get it to run for $n = 10^{10}$ in under a minute. 

This does not imply that the sieve is useless for our purposes of calculating $\pi(10^{12})$. In fact, we will be using it in the next few sections.

# Without knowing all the primes (Legendre's Formula)

To reduce the amount of memory required for our computation we will use Legendre's Formula. It essentially allows you to count primes up to $n$, while only knowing the primes up to $\sqrt{n}$. Now let's proceed to prove it.

Let $\phi(n, a)$ be the amount of numbers less than or equal to $n$, which are not divisible by the first $a$ primes. Then we can calculate $\phi(n, a)$ using the inclusion-exclusion principle:

$$
\phi(n, a) = n
- \sum_{p_i} \lfloor \frac{n}{p_i} \rfloor
+ \sum_{p_i < p_j} \lfloor \frac{n}{p_i p_j} \rfloor
- \sum_{p_i < p_j < p_k} \lfloor \frac{n}{p_i p_j p_k} \rfloor
+ \dots
$$

where all the $i, j, k, \dots \leq a$.

Now, let's prove the following fact: suppose $p \leq n$. Then either $p$ is $1$, it has a divisor $d \leq \sqrt{n}$ or it is prime. If $p = 1$, we are done. If $p \leq \sqrt{n}$ then it has a divisor $d \leq \sqrt{n}$, where $d = p$. Now let $p > \sqrt{n}$. We will now proceed by contradiction. Suppose $d$ is the smallest divisor of $p$ larger than $1$. Assume said divisor is larger than $\sqrt{n}$. Clearly $p/d$ is also a divisor of $p$ and thus $p/d \geq d > \sqrt{n}$. But $p = p/d \times d > \sqrt{n} × \sqrt{n} = n$, which is impossible. Therefore $d$ must not exceed $\sqrt{n}$.

From the previous fact we have that:

$$
\phi(n, \pi(\sqrt{n})) = 1 + \pi(n) - \pi(\sqrt{n})
$$

Which can be rearranged to find $\pi(n)$. This is Legendre's Formula.

Now let's write an implementation for Legendre's Formula. First we need to find all primes up to $\sqrt{n}$. This can be done in multiple ways, but the sieve of Eratosthenes is particularly effective and simple:

```rust
fn isqrt(x: usize) -> usize {
    return (x as f64).sqrt() as usize;
}

// Calculate primes up to isqrt(n)
fn get_primes(n: usize) -> Vec<usize> {
    let l = isqrt(n);
    let capacity = (1.5 * (l as f64) / (l as f64).ln()) as usize;
    let mut primes = Vec::with_capacity(capacity);
    let mut flags = Vec::with_capacity(l);
    for _ in 0..l {
        flags.push(true);
    }
    flags[0] = false;

    for i in 0..l {
        if flags[i] {
            let x = i + 1;
            for m in ((i + x)..l).step_by(x) {
                flags[m] = false;
            }
            primes.push(x);
        }
    }
    return primes;
}
```

Notice that we preallocate $1.5 \frac{n}{log n}$ as the capacity for the `primes` vector. This is because $\pi(n)$ is upper bounded by this quantity, as shown on [Wikipedia](https://en.wikipedia.org/wiki/Prime-counting_function). 

And now we need to calculate the sum. Because Legendre's Formula is an infinite sum, we need to find a stopping point. We can get a clear cutoff point by noting that, in each sum, the smallest divisor is the product of the first $m$ primes. At some point this product is going to get larger than $n$, at which point all terms in the sum will be $0$. This logic is implemented with the function `get_max_depth`:

```rust
fn get_max_depth(n: usize, primes: &Vec<usize>) -> usize {
    let mut max_depth = 0;
    let mut min_product = 1;
    while max_depth < primes.len() {
        min_product *= primes[max_depth];
        if min_product > n { break; }
        max_depth += 1;
    }
    return max_depth;
}
```

Finally, we need to implement the function that calculates each of the sums. Because the number of primes that you must use in each sum is not fixed, we need to implement this function using recursion. I don't want to go into details of how to do that, so this is what the function ends up looking like:

```rust
fn calculate_sum(n: usize, primes: &Vec<usize>, depth: usize, level: usize, maybe_last_index: Option<usize>, product: usize) -> usize {
    if depth < level { return n / product; }
    let mut result = 0;
    let start_index = match maybe_last_index {
        Some(last_index) => last_index + 1,
        None => 0,
    };
    let end_index = primes.len() - depth + level;
    for index in start_index..end_index {
        let next_level = level + 1;
        let next_last_index = Some(index);
        let next_product = product * primes[index];
        if next_product > n { break; }
        result += calculate_sum(n, primes, depth, next_level, next_last_index, next_product);
    }
    return result;
}
```

Finally let's write the `count` function, which is now trivial to implement: 

```rust
pub fn count(n: usize) -> usize {
    let mut result: isize = 0;
    let primes = get_primes(n);
    let max_depth = get_max_depth(n, &primes);
    
    // Use Legendre's Formula
    result += primes.len() as isize;
    result -= 1;

    for depth in 0..(max_depth + 1) {
        let term = calculate_sum(n, &primes, depth, 1, None, 1) as isize;
        if depth % 2 == 0 {
            result += term;
        } else {
            result -= term;
        }
    }

    return result as usize;
}
```

Benchmarks show us that Legendre's formula is faster than the Sieve of Eratosthenes for $n = 10^9$:

```txt
Begun testing the legendre implementation with n = 10^9.
The amount of prime numbers that are less than or equal to 10^9 is 50847534.
Elapsed: 4.29s
Finished testing the legendre implementation with n = 10^9.
```

Sadly, Legendre's formula scales poorly. With $n = 10^{10}$ we almost reached the minute mark:

```txt
Begun testing the legendre implementation with n = 10^10.
The amount of prime numbers that are less than or equal to 10^10 is 455052511.
Elapsed: 55.34s
Finished testing the legendre implementation with n = 10^10.
```

so it does not make sense to attempt $n = 10^{12}$.

This failure to scale is due to the fact Legendre's formula has to iterate over millions of choices of prime multiplications. Thankfully, our next approach will get rid of this problem.

# Meissel–Lehmer's algorithm

Now comes the interesting part of the post. In [this article](https://projecteuclid.org/download/pdf_1/euclid.ijm/1255455259) D. H. Lehmer introduces a very efficient formula for computing $\pi(n)$. Let's prove it.

Let $P_k(n, a)$ be the amount of numbers less than or equal to $n$, which are not divisible by any of the first $a$ primes and which have exactly $k$ prime factors. Then:

$$
\begin{equation}
\phi(n, a) = \sum_{k = 0}^{r - 1} P_k(n, a)
\end{equation}
$$

for some finite $r$, as at some point the product of enough primes must be larger than $n$.

Note that:

$$
\begin{equation}
P_1(n, a) = \pi(n) - a
\end{equation}
$$

Joining $(1)$ and $(2)$ and using the fact that $P_0(n, a) = 1$ we get:

$$
\pi(n) = a - 1 + \phi(n, a) - \sum_{k  = 2}^{r - 1} P_k(n, a)
$$

And with the right choice of $a$, and an efficient method to calculate $\phi(n, a)$ and the $P_k(n, a)$, we have an efficient formula for $\pi(n)$.

Let's start by computing $P_2(n, a)$. Let $p_i$ be the $i$-th prime. Then:

$$
P_2(n, a) = \sum_{p_i p_j \leq n} 1
$$

$$
P_2(n, a) = \sum_{p_a < p_i \leq n / p_i} \sum_{p_i \leq p_j \leq n / p_i} 1
$$

$$
P_2(n, a) = \sum_{p_a < p_i \leq \sqrt{n}} \sum_{p_i \leq p_j \leq n / p_i} 1
$$

$$
P_2(n, a) = \sum_{p_a < p_i \leq \sqrt{n}} \{ \pi(n / p_i) - (i - 1) \}
$$

Now let $b = \pi(\sqrt{n})$ and $c = \pi(\sqrt[3]{n})$. Then we can rewrite the above as follows:

$$
P_2(n, a) = \sum_{p_a < p_i \leq \sqrt{n}} \{ \pi(n / p_i) - (i - 1) \}
$$

$$
P_2(n, a) = \sum_{a < i \leq b} \{ \pi(n / p_i) - (i - 1) \}
$$

$$
P_2(n, a) = \sum_{a < i \leq b} \pi(n / p_i) - \sum_{a < i \leq b} (i - 1)
$$

$$
\begin{equation}
P_2(n, a) = \sum_{a < i \leq b} \pi(n / p_i) - \frac{1}{2} (b - a) (b + a - 1) \\
\end{equation}
$$

Now for $k = 3$, a similar procedure yields:

$$
P_3(n, a) = \sum_{p_i p_j p_l \leq n} 1
$$

$$
P_3(n, a) =
\sum_{p_a < p_i \leq n / p_i^2}
\sum_{p_i \leq p_j \leq n / p_i p_j}
\sum_{p_j \leq p_l \leq n / p_i p_j} 1
$$

$$
P_3(n, a) =
\sum_{p_a < p_i \leq \sqrt[3]{n}}
\sum_{p_i \leq p_j \leq (n / p_i)^{1/2}}
\sum_{p_j \leq p_l \leq n / p_i p_j} 1
$$

$$
P_3(n, a) =
\sum_{a < i \leq c}
\sum_{i \leq j \leq b_i}
\sum_{j \leq l \leq \pi(n / p_i p_j)} 1
$$

$$
\begin{equation}
P_3(n, a) =
\sum_{a < i \leq c}
\sum_{i \leq j \leq b_i} \{ \pi(n / p_i p_j) - (j - 1) \}
\end{equation}
$$

where $b_i = \pi((n / p_i)^{1/2})$.

Now let $a = \pi(n^{1/k})$. Choose $k$ or more primes larger than $p_a$. Then the product of those primes is larger than $n$. Therefore $P_k(n, a) = 0, P_{k + 1}(n, a) = 0, \: \dots$. Thus, we can derive several distinct formulas through the choice of $a$.

If we set $a = b = \pi(\sqrt{n})$, we get $\pi(n) = b - 1 + \phi(n, b)$, which is Legendre's formula.

If we set $a = c = \pi(\sqrt[3]{n})$ we get $\pi(n) = c - 1 + \phi(n, c) - P_2(n, c)$ or equivalently from plugging $(3)$:

$$
\begin{equation}
\pi(n) = \phi(n, c) + \frac{1}{2} (b + c - 2) (b - c + 1) - \sum_{c < i \leq b} \pi(n / p_i) 
\end{equation}
$$

which is Meissel's formula.

But the choice of $a$ we are interested in is $a = \pi(n^{1 / 4})$. With this choice the formula expands to also include $P_3(n, a)$ as follows:

$$
\begin{equation}
\begin{align*}
\pi(n)
&= \phi(n, a) + \frac{1}{2} (b + a - 2) (b - a + 1) - \sum_{a < i \leq b} \pi(n / p_i) \\
&- \sum_{a < i \leq c}
\sum_{i \leq j \leq b_i} \{ \pi(n / p_i p_j) - (j - 1) \}
\end{align*}
\end{equation}
$$

which is Meissel-Lehmer's formula. Essentially, it is a recursive version of the prime counting function, and therefore we can speed up the computation by knowing the values of $\pi$ up to a large enough $n$ using the other algorithms. Now let's find a way to calculate $\phi(n, a)$ efficiently. First notice the following recursion:

$$
\begin{equation}
\phi(n, a) = \phi(n, a - 1) - \phi(n / p_a, a - 1)
\end{equation}
$$

To prove that this is true, note that the amount of numbers that are divisible by $p_a$ but not by $p_1, p_2, \dots, p_{a - 1}$ is given by $\phi(n, a - 1) - \phi(n, a)$. On the other hand, this amount can be expressed as:

$$
= |\{ \: x \: | \: x = p_a x' \leq n, p_1, p_2, \dots, p_{a - 1} \nmid x' \: \}|
$$

$$
= |\{ \: x' \: | \: x' \leq n / p_a, p_1, p_2, \dots, p_{a - 1} \nmid x' \: \}|
$$

$$
= \phi(n / p_a, a - 1)
$$

which proves the recursion. Before using the recursion, let's prove a few base cases:

*Case 1*: $\phi(n, 0) = n$. This follows directly from the definition.

*Case 2*: $\phi(n, 1) = n - \lfloor n / 2 \rfloor$. These are the numbers that are not divisble by $2$.

*Case 3*: $\phi(n, 2) = n - \lfloor n / 2 \rfloor - \lfloor n / 3 \rfloor + \lfloor n / 6 \rfloor$. This follows from the inclusion-exclusion principle using the primes $2$ and $3$.

*Case 4*: If $n \leq p_a$, then $\phi(n, a) = 1$. Clearly, all $x \leq n$ are divisible by one of $p_1, p_2, \dots, p_a$, except for the number $1$.

With the base cases out of the way let's write an expansion for $\phi(n, a)$ using the recursion formula:

$$
\phi(n, a) = \phi(n, a - 1) - \phi(n / p_a, a - 1)
$$

$$
\phi(n, a) = \phi(n, a - 2) - \phi(n / p_a, a - 1) - \phi(n / p_{a - 1}, a - 2)
$$

$$
\dots
$$

$$
\begin{equation}
\phi(n, a) = \phi(n, 2) - \sum_{i = 3}^a \phi(n / p_i, i - 1)
\end{equation}
$$

And with that we have all the parts we need to begin implementing Meissel-Lehmer formula.

To begin implementing, first we need a list of all primes up to $b$, and a way to calculate $\pi(n)$, for "small" values of $n$. Finding the primes can be done using the Sieve of Eratosthenes, and once we have the primes we can perform binary search on the list of primes to calculate $\pi(n)$ up to the limit we used to calculate the primes. Our implementation looks like this:

```rust
struct PrimeTable {
    limit: usize,
    primes: Vec<usize>, 
}

impl PrimeTable {
    pub fn new(limit: usize) -> PrimeTable {
        let capacity = (1.5 * (limit as f64) / (limit as f64).ln()) as usize;
        let mut primes = Vec::with_capacity(capacity);

        let mut flags = Vec::with_capacity(limit);
        for _ in 0..limit {
            flags.push(true);
        }
        flags[0] = false;

        for i in 0..limit {
            if flags[i] {
                let x = i + 1;
                for m in ((i + x)..limit).step_by(x) {
                    flags[m] = false;
                }
                primes.push(x);
            }
        }

        return PrimeTable { limit, primes };
    }

    pub fn get_prime_count(&self, n: usize) -> Option<usize> {
        if n > self.limit { return None; }
        let mut start = 0;
        let mut end = self.primes.len() - 1;
        while end - start > 1 {
            let middle = (start + end) / 2;
            if self.primes[middle] <= n {
                start = middle;
            } else {
                end = middle;
            }
        }
        if start == end || self.primes[end] > n {
            return Some(start + 1);
        } else {
            return Some(end + 1);
        }
    }

    pub fn get_prime(&self, i: usize) -> usize {
        return self.primes[i - 1];
    }
}
```

Notice that this table of primes can be reused in the implementation of the recursive version of $\phi(n, a)$, as that function requires a list of primes. Our implementation of $phi$ follows trivially from $(8)$ and the base cases:

```rust
fn phi(n: usize, a: usize, table: &PrimeTable) -> usize {
    if a == 0 {
        return n;
    } else if a == 1 {
        return n - (n / 2);
    } else if n <= table.get_prime(a) {
        return 1;
    }
    let mut result = n - (n / 2) - (n / 3) + (n / 6);
    for i in 3..(a + 1) {
        result -= phi(n / table.get_prime(i), i - 1, &table);
    }
    return result;
}
```

We need a way to calculate the integer $n$-th root of a number. For our purposes, we used the following implementation:

```rust
fn integer_nth_root(n: usize, r: f64) -> usize {
    return (n as f64).powf(1.0 / r) as usize;
}
```

Because `f64` is not an "exact" type, this implementation may fail for some inputs. Nevertheless, it is good enough for the scale at which we are working.

Finally, Meissel-Lehmer's implementation follows trivially from $(6)$:

```rust
fn meissel_lehmer(n: usize, table: &PrimeTable) -> usize {
    if let Some(result) = table.get_prime_count(n) {
        return result;
    }

    let a = meissel_lehmer(integer_nth_root(n, 4.0), &table);
    let b = meissel_lehmer(integer_nth_root(n, 2.0), &table);
    let c = meissel_lehmer(integer_nth_root(n, 3.0), &table);

    let mut result = phi(n, a, &table) + ((b + a - 2) * (b - a + 1)) / 2;

    // Calculate P_2
    for i in (a + 1)..(b + 1) {
        result -= meissel_lehmer(n / table.get_prime(i), &table);
    }

    // Calculate P_3
    for i in (a + 1)..(c + 1) {
        let b_i = meissel_lehmer(integer_nth_root(n / table.get_prime(i), 2.0), &table);
        for j in i..(b_i + 1) {
            let denominator = table.get_prime(i) * table.get_prime(j);
            result -= meissel_lehmer(n / denominator, &table) - (j - 1);
        }
    }

    return result;
}
```

With all of these parts, our `count` function only needs to initialize a `PrimeTable`, and use `meissel_lehmer` on the given input.

```rust
pub fn count(n: usize) -> usize {
    let limit = std::cmp::min(n, usize::pow(10, 9));
    let prime_table = PrimeTable::new(limit);
    return meissel_lehmer(n, &prime_table);
}
```

Because our initial problem is calculating $\pi(10^{12})$, we chose to calculate the prime list up to $10^9$, even though we only needed to do so up to $10^6$. This reduces the number of `meissel_lehmer` calls, which helps speed up the computation.

Because our implementation essentially uses the sieve algorithm  to calculate primes up to $n = 10^9$, we know it will take at least ~15s to finish. Let's benchmark $n = 10^{10}$:

```txt
Begun testing the meissel_lehmer implementation with n = 10^10.
The amount of prime numbers that are less than or equal to 10^10 is 455052511.
Elapsed: 16.09s
Finished testing the meissel_lehmer implementation with n = 10^10.
```

Notice that it does not take much to finish after the 15s mark. Let's see if this extends all the way up to $n = 10^{12}$: 

```txt
Begun testing the meissel_lehmer implementation with n = 10^12.
The amount of prime numbers that are less than or equal to 10^12 is 37607912018.
Elapsed: 18.97s
Finished testing the meissel_lehmer implementation with n = 10^12.
```

And it does!

# Conclusion

In this post we've proven and implemented an efficient method for calculating $\pi(n)$ for large enough $n$. Hopefully the reader has learned a new thing or two in this post!

If you want to check out the code we used, head over to my [Github](https://github.com/sebasgarcep/counting-primes-really-fast).