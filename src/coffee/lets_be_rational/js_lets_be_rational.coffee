
class js_lets_be_rational

    #-------nodejs---------
    if `(typeof lets_be_rational === "undefined" && lets_be_rational === null)` and require?
        lets_be_rational = require('lets_be_rational')
        normaldistribution = require('normaldistribution')
    else
        lets_be_rational = window.lets_be_rational
        normaldistribution = window.normaldistribution
    #-------------------#

    getLetsBeRational = () ->
        if `(typeof lets_be_rational === "undefined" && lets_be_rational === null)`
            lets_be_rational = new lets_be_rational()
        return lets_be_rational

    black: (F, K, sigma, T, q) ->
        return getLetsBeRational().black(F, K, sigma, T, q)

    implied_volatility_from_a_transformed_rational_guess: (price, F, K, T, q) ->
        return getLetsBeRational().implied_volatility_from_a_transformed_rational_guess(price, F, K, T, q)

    implied_volatility_from_a_transformed_rational_guess_with_limited_iterations: (price, F, K, T, q, N) ->
        return getLetsBeRational().implied_volatility_from_a_transformed_rational_guess_with_limited_iterations(price, F, K, T, q, N)

    normalised_black: (x, s, q) ->
        return getLetsBeRational().normalised_black(x, s, q)

    normalised_black_call: (x, s) ->
        return getLetsBeRational().normalised_black_call(x, s)

    normalised_implied_volatility_from_a_transformed_rational_guess: (beta, x, q) ->
        return getLetsBeRational().normalised_implied_volatility_from_a_transformed_rational_guess(beta, x, q)

    normalised_implied_volatility_from_a_transformed_rational_guess_with_limited_iterations: (beta, x, q, N) ->
        return getLetsBeRational().normalised_implied_volatility_from_a_transformed_rational_guess_with_limited_iterations(beta, x, q, N)

    normalised_vega: (x, s) ->
        return getLetsBeRational().normalised_vega(x, s)

    norm_cdf: (z) ->
        return normaldistribution.norm_cdf(z)

if module?
    module.exports = new js_lets_be_rational()
window.js_lets_be_rational = new js_lets_be_rational()
