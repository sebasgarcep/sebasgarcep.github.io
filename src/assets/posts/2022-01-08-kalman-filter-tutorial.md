---
id: kalman-filter-tutorial
title: Understanding the Kalman Filter
date: 2022-01-08
tags: [Mathematics, Data Assimilation, Kalman Filter, Rust]
image:
    src: /assets/img/2022-01-08-kalman-filter/preview.jpg
    alt: Boats on a lake
---

Society depends on having correct estimates of what may happen. Whether it is the climate or traffic, humans have built models of reality which help us make better decisions. But any model is bound to have a margin of error with respect to reality, and as time passes the model will diverge from reality. To prevent this we would like to integrate observations from reality into the model from time to time. But we run into the problem that observations of reality are often incomplete or have a margin of error themselves. The Kalman Filter is a method of combining both sources of information (model state with observations) in a way that reduces the margin of error in the output.

This post will introduce the Kalman Filter, prove it and implement it in Rust. If you are uncomfortable with math, this is the moment to back out or jump to the implementation part as the presentation will be math-heavy.

# Introducing the Kalman Filter

Assume that a variable $x \in \mathbb{R}^m$ models the state of a system that evolves over time. At a time step $t$ we have an estimation of the current state we will call $x_{\text{esti}}$. We have a linear map $F$ that helps us predict the next state of the system $x_{\text{pred}} := F x_{\text{esti}}$, and we have a measurement of the next state of the system $z \in \mathbb{R}^n$. Notice that the measurement uses another letter. This is to denote the fact that the oberservation and the model state are not necessarily on the same space, e.g. the observation may have lower dimensionality. Assume there is a linear function $H$ that maps from model space to observation space.

Now we need to understand and model all our sources of uncertainty. To simplify things we will assume all errors are normally distributed with mean zero. This is not always true, but it is a robust enough assumption that even when it doesn't hold the Kalman Filter still provides good enough results. Firstly, the model state will always have a discrepancy with the real system. Let $P_{\text{esti}}$ be the covariance matrix of the model state noise. Secondly, physical observations have a degree of uncertainty as no real-life tool is perfect. Let $R$ describe the covariance matrix of the observation noise. Finally, our prediction function will rarely be a complete model of reality and this discrepancy will introduce errors into the calculations. Let $Q$ be the covariance matrix of process noise.

With all the setup out of the way we can introduce the Kalman Filter Equations. First consider the equations that propagate the model state and covariance

$$
\begin{align*}
x_{\text{pred}} &= F x_{\text{esti}} \\
P_{\text{pred}} &= F P_{\text{esti}} F^T + Q \\
\end{align*}
$$

Now, let the Kalman Gain $K$ be

$$
K = P_{\text{pred}} H^T (H P_{\text{pred}} H^T + R)^{-1}
$$

Then the correction in model state $x_{\text{corr}}$ and covariance $P_{\text{corr}}$ obtained by applying the Kalman Filter is given by the following set of formulas

$$
\begin{align*}
x_{\text{corr}} &= x_{\text{pred}} + K (z - H x_{\text{pred}}) \\
P_{\text{corr}} &= (I - K H) P_{\text{pred}} (I - K H)^T + K R K^T
\end{align*}
$$

Which we will formally prove in the next section.

## Deriving the Kalman Filter

From the setup we have that $x_{\text{pred}}$ is sampled from $\mathcal{N}(x_{\text{real}}, P_{\text{pred}})$ and $z$ is sampled from $\mathcal{N}(H x_{\text{real}}, R)$. We cannot use these expressions to find $x_{\text{real}}$ but we can find a good approximation $x_{\text{corr}}$. Consider the following expression given by maximum likelihood estimation:

$$
\frac{1}{\sqrt{(2 \pi)^m |P_{\text{pred}}|}} e^{-\frac{1}{2} (x_{\text{pred}} - x_{\text{corr}})^T P_{\text{pred}}^{-1} (x_{\text{pred}} - x_{\text{corr}})} \cdot \frac{1}{\sqrt{(2 \pi)^n |R|}} e^{-\frac{1}{2} (z - H x_{\text{corr}})^T R^{-1} (z - H x_{\text{corr}})}
$$

which can be rewritten to

$$
\frac{1}{\sqrt{(2 \pi)^{m + n} |P_{\text{pred}}| |R|}} e^{-\frac{1}{2} ((x_{\text{pred}} - x_{\text{corr}})^T P_{\text{pred}}^{-1} (x_{\text{pred}} - x_{\text{corr}}) + (z - H x_{\text{corr}})^T R^{-1} (z - H x_{\text{corr}}))}
$$

We would like to find the value of $x_{\text{corr}}$ that optimizes the previous expression. For that we need to optimize the argument of the exponential function:

$$
(x_{\text{pred}} - x_{\text{corr}})^T P_{\text{pred}}^{-1} (x_{\text{pred}} - x_{\text{corr}}) + (z - H x_{\text{corr}})^T R^{-1} (z - H x_{\text{corr}})
$$

To find the optimal value of $x_{\text{corr}}$ we derive this expression with respect to it and equate the result to zero. We are left with the following equation

$$
\begin{align*}
&0 = -2 (x_{\text{pred}} - x_{\text{corr}})^T P_{\text{pred}}^{-1} - 2 (z - H x_{\text{corr}})^T R^{-1} H \\
&\Rightarrow 0 = (x_{\text{pred}} - x_{\text{corr}})^T P_{\text{pred}}^{-1} + (z - H x_{\text{corr}})^T R^{-1} H \\
&\Rightarrow 0 = P_{\text{pred}}^{-T} (x_{\text{pred}} - x_{\text{corr}}) + H^T R^{-T} (z - H x_{\text{corr}}) \\
&\Rightarrow 0 = P_{\text{pred}}^{-1} (x_{\text{pred}} - x_{\text{corr}}) + H^T R^{-1} (z - H x_{\text{corr}}) \\
&\Rightarrow (P_{\text{pred}}^{-1} + H^T R^{-1} H) x_{\text{corr}} = P_{\text{pred}}^{-1} x_{\text{pred}} + H^T R^{-1} z \\
&\Rightarrow x_{\text{corr}} = (P_{\text{pred}}^{-1} + H^T R^{-1} H)^{-1} (P_{\text{pred}}^{-1} x_{\text{pred}} + H^T R^{-1} z) \\
\end{align*}
$$

An application of the [Woodbury matrix identity](https://en.wikipedia.org/wiki/Woodbury_matrix_identity) shows that

$$
\begin{align*}
(P_{\text{pred}}^{-1} + H^T R^{-1} H)^{-1}
&= P_{\text{pred}} - P_{\text{pred}} H^T (H P_{\text{pred}} H^T + R)^{-1} H P_{\text{pred}} \\
&= P_{\text{pred}} - K H P_{\text{pred}} \\
\end{align*}
$$

where the last part follows from the definition of the Kalman Gain $K$. Therefore

$$
\begin{align*}
&x_{\text{corr}} = (P_{\text{pred}}^{-1} + H^T R^{-1} H)^{-1} (P_{\text{pred}}^{-1} x_{\text{pred}} + H^T R^{-1} z) \\
&\Rightarrow x_{\text{corr}} = (P_{\text{pred}} - K H P_{\text{pred}}) \cdot (P_{\text{pred}}^{-1} x_{\text{pred}} + H^T R^{-1} z) \\
&\Rightarrow x_{\text{corr}} = x_{\text{pred}} - K H x_{\text{pred}} + (P_{\text{pred}} H^T R^{-1} - K H P_{\text{pred}} H^T R^{-1}) z \\
\end{align*}
$$

But

$$
\begin{align*}
&K = P_{\text{pred}} H^T (H P_{\text{pred}} H^T + R)^{-1} \\
&\Rightarrow K (H P_{\text{pred}} H^T + R) = P_{\text{pred}} H^T \\
&\Rightarrow K H P_{\text{pred}} H^T = P_{\text{pred}} H^T - K R \\
\end{align*}
$$

Which applied to the previous formula yields

$$
\begin{align*}
&x_{\text{corr}} = x_{\text{pred}} - K H x_{\text{pred}} + (P_{\text{pred}} H^T R^{-1} - K H P_{\text{pred}} H^T R^{-1}) z \\
&\Rightarrow x_{\text{corr}} = x_{\text{pred}} - K H x_{\text{pred}} + (P_{\text{pred}} H^T R^{-1} - (P_{\text{pred}} H^T - K R) R^{-1}) z \\
&\Rightarrow x_{\text{corr}} = x_{\text{pred}} - K H x_{\text{pred}} + (P_{\text{pred}} H^T R^{-1} - P_{\text{pred}} H^T R^{-1} + K) z \\
&\Rightarrow x_{\text{corr}} = x_{\text{pred}} - K H x_{\text{pred}} + K z \\
&\Rightarrow x_{\text{corr}} = x_{\text{pred}} + K (z - H x_{\text{pred}}) \\
\end{align*}
$$

which proves the first of the update formulas. The second results from noticing that the previous formula can be rewritten as

$$
x_{\text{corr}} = (I - K H) x_{\text{pred}} + K z
$$

and therefore the update formula for the covariance is

$$
P_{\text{corr}} = (I - K H) P_{\text{pred}} (I - K H)^T + K R K^T
$$d

which finalizes the proof.

## Applying the Kalman Filter

Suppose we have a signal-repeating satellite orbiting around the Earth. Thanks to [Kepler's laws of planetary motion](https://en.wikipedia.org/wiki/Kepler's_laws_of_planetary_motion) we know that this orbit is elliptical, with the Earth at one of its foci. Any ellipse can be described by its semimajor axis $a$ (half the length of its largest diameter) and its semiminor axis $b$ (half the length of its smallest diameter). The focal distance (distance from the center of the ellipse to either of the foci) can be found with the formula $c = \sqrt{a^2 - b^2}$. The orbit of the satellite and the position of the Earth relative to it will look something like this plot:

![Real Orbit with Earth at its Foci](/assets/img/2022-01-08-kalman-filter-tutorial/real_orbit.svg)

Because we have a signal-repeating satellite orbiting the earth, we can measure how far away from the Earth it is by bouncing a signal and measuring how long it takes to come back (the signal will travel at the speed of light). We can use this tool to measure the periapsis (closest distance to Earth) and apoapsis of the orbit (furthest away from Earth). Clearly

$$
\begin{align*}
\text{periapsis} &= a - c \\
\text{apoapsis} &= a + c \\
\end{align*}
$$

and we can solve this system of equations to obtain the values of $a$ and $c$. The value of $b$ can be obtained by using the formula $c = \sqrt{a^2 - b^2}$. With this information we can model the [orbit of the satellite](https://en.wikipedia.org/wiki/Kepler's_laws_of_planetary_motion#Position_as_a_function_of_time) by solving [Kepler's equation](https://en.wikipedia.org/wiki/Kepler%27s_equation#Numerical_approximation_of_inverse_problem).

In real life we are going to face the problem that the measurement of the periapsis and apoapsis will be noisy, which means we won't have a perfect approximation of the orbit of the satellite. We also cannot constantly measure the position of the satellite in space (using the distance and the angle relative to Earth) as each measurement will have some amount of noise to it, and the farther away the satellite is, the noisier the measurements get. We can observe this behaviour in the following graph

![Real Orbit with Measurements](/assets/img/2022-01-08-kalman-filter-tutorial/meas_orbit.svg)

Using the Kalman Filter we can combine both sources of information though (model state and measurements) to obtain better results.

We will model the motion of the satellite using a constant position model, i.e. we will set $F$ to be the identity map. This may seem like an inappropiate choice, but later on we will show that it gives good enough results for a short exercise like this. We will set $Q = \sigma I$, where sigma is the uncertainty in distance measurements.

The satellite gives us a distance-angle reading which satify the hypothesis that the error in our observations should Gaussian with zero mean. We will not use this observation directly in the Kalman Filter. The reason is that two angles can be physically very close and numerically very far away, e.g. doing two and a half turns around the circle gives the same angle as doing just half a turn, but numerically they are distinct by $4 \pi$ radians. This will give us problems later on when we calculate $z - H x_{\text{pred}}$ in the Kalman Filter equations. Instead we will map this observation into cartesian coordinates. Therefore the observation map $H$ is the identity map.

Notice that this operation on the observation transforms the distribution of our errors. Specifically, the further away we get from the foci, the larger the errors get, as we can see in the above graph. We can get around this by scaling $R$ by the distance squared between the satellite and the Earth.

With all this setup done we can now implement the Kalman Filter and our model.

## Rust Implementation

Let's start by implementing the Kalman Filter as a Trait:

```rust
use crate::types::{ArrayMatrix, ArrayVector};
use nalgebra::DMatrix;

pub trait KalmanFilterModel {
    fn predict_mat(&self, x: &ArrayVector) -> ArrayMatrix;
    fn predict_cov(&self, x: &ArrayVector) -> ArrayMatrix;

    fn observe_mat(&self, x: &ArrayVector) -> ArrayMatrix;
    fn observe_cov(&self, x: &ArrayVector) -> ArrayMatrix;

    fn predict(&self, x: &ArrayVector, p_inpt: &ArrayMatrix) -> (ArrayVector, ArrayMatrix) {
        let f = self.predict_mat(x);
        let q = self.predict_cov(x);

        let x_pred = &f * x;
        let p_pred = &f * p_inpt * &f.transpose() + &q;

        (x_pred, p_pred)
    }

    fn update(&self, x: &ArrayVector, p: &ArrayMatrix, z: &ArrayVector) -> (ArrayVector, ArrayMatrix) {
        let model_size = x.len();
        let i: ArrayMatrix = DMatrix::identity(model_size, model_size);
        let h = self.observe_mat(x);
        let r = self.observe_cov(x);
        let k = p * &h.transpose() * (&h * p * &h.transpose() + &r).try_inverse().unwrap();
        
        let x_hat = x + &k * (z - &h * x);
        let p_hat = (&i - &k * &h) * p * (&i - &k * &h).transpose() + &k * &r * &k.transpose();
    
        (x_hat, p_hat)
    }
}
```

This allows each model to provide its own implementation of the $F$ (`predict_mat`), $Q$ (`predict_cov`), $H$ (`observe_mat`) and $R$ (`observe_cov`) matrices while allowing us to define a default behaviour for the `predict` and `update` equations. 

Our model, which we named `ConstantOrbitModel` has the following implementation:

```rust
use crate::filters::KalmanFilterModel;
use crate::types::{ArrayMatrix, ArrayVector};
use nalgebra::{dmatrix, DMatrix};

pub struct ConstantOrbitModel {
    pub position_noise: f64,
    pub e_meas: ArrayVector,
}

impl ConstantOrbitModel {
    pub fn new(
        position_noise: f64,
        e_meas: ArrayVector,
    ) -> Self {
        ConstantOrbitModel {
            position_noise,
            e_meas,
        }
    }
}

impl KalmanFilterModel for ConstantOrbitModel {
    fn predict_mat(&self, _x: &ArrayVector) -> ArrayMatrix {
        DMatrix::identity(2, 2)
    }

    fn predict_cov(&self, _x: &ArrayVector) -> ArrayMatrix {
        dmatrix![
            self.position_noise, 0.0;
            0.0, self.position_noise;
        ]
    }

    fn observe_mat(&self, _x: &ArrayVector) -> ArrayMatrix {
        DMatrix::identity(2, 2)
    }

    fn observe_cov(&self, x: &ArrayVector) -> ArrayMatrix {
        dmatrix![
            self.position_noise * (x - &self.e_meas).norm_squared(), 0.0;
            0.0, self.position_noise * (x - &self.e_meas).norm_squared();
        ]
    }
}
```

which does the same things we discussed in the previous section.

Finally we implement the orbit simulation and the functions that output the results to the SVG graphs you are seeing. I will not discuss those parts here, as they are outside the scope of the tutorial, but you can take a look at the complete source code [here](https://github.com/sebasgarcep/kalman-filter-tutorial).

## Conclusion

After implementing the Kalman Filter we obtain the following results

![Applying Kalman Filter Corrections](/assets/img/2022-01-08-kalman-filter-tutorial/corr_orbit.svg)

The green line shows the measurements over time, and the yellow line shows the orbit predicted by our Kalman Filter model. As we can see it is far more stable and a better approximation of the real orbit than the measurements themselves. In fact the relative error rate over time is far smaller with the Kalman Filter corrections than without them:

![Relative error rates over time](/assets/img/2022-01-08-kalman-filter-tutorial/error.svg)

And this is with a constant position model! With better models or numerical stabilization procedures we are sure to obtain even better results. This is the power of the Kalman Filter.

I hope that this article gave you a better understanding of the Kalman Filter and that you may be able to apply it to your projects soon.

## References

- [Source code for the tutorial](https://github.com/sebasgarcep/kalman-filter-tutorial)
- [http://web.mit.edu/kirtley/kirtley/binlustuff/literature/control/Kalman%20filter.pdf](http://web.mit.edu/kirtley/kirtley/binlustuff/literature/control/Kalman%20filter.pdf)
- [https://en.wikipedia.org/wiki/Kalman_filter](https://en.wikipedia.org/wiki/Kalman_filter)
- [https://en.wikipedia.org/wiki/Woodbury_matrix_identity](https://en.wikipedia.org/wiki/Woodbury_matrix_identity)
- [https://en.wikipedia.org/wiki/Kepler's_laws_of_planetary_motion](https://en.wikipedia.org/wiki/Kepler's_laws_of_planetary_motion)
- [https://en.wikipedia.org/wiki/Kepler's_laws_of_planetary_motion#Position_as_a_function_of_time](https://en.wikipedia.org/wiki/Kepler's_laws_of_planetary_motion#Position_as_a_function_of_time)
- [https://en.wikipedia.org/wiki/Kepler%27s_equation#Numerical_approximation_of_inverse_problem](https://en.wikipedia.org/wiki/Kepler%27s_equation#Numerical_approximation_of_inverse_problem)