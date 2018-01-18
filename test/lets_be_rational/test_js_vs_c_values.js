/*jshint esversion: 6 */
QUnit.module("Compare Values with C++ lets_be_rational");

function almostEqual(actual, expected) {
    var message = "Expected: ".concat(expected, "\ Actual: ", actual);
    if (isNaN(actual) && isNaN(expected)) {
        QUnit.assert.ok(true, message);
    } else {
        var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
        var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
        if (is_chrome || is_firefox) {
            QUnit.assert.ok(Math.abs(actual - expected) <= 1.0e-13, message);
        } else {
            QUnit.assert.equal(actual, expected, message);
        }
    }
}

var ioValues = TestValues;
var TestCases = ioValues.input.length;

QUnit.test("black", function () {

    for (var i = 0; i < TestCases; i++) {
        var F = parseFloat(ioValues.input[i].F);
        var K = parseFloat(ioValues.input[i].K);
        var sigma = parseFloat(ioValues.input[i].sigma);
        var T = parseFloat(ioValues.input[i].T);
        var q = parseFloat(ioValues.input[i].q);  // CALL = 1 PUT = -1

        var expected = parseFloat(ioValues.output[i].black);
        var actual = js_lets_be_rational.black(F, K, sigma, T, q);

        almostEqual(actual, expected);
    }
});

QUnit.test("implied_volatility_from_a_transformed_rational_guess", function () {
    for (var i = 0; i < TestCases; i++) {
        var F = parseFloat(ioValues.input[i].F);
        var K = parseFloat(ioValues.input[i].K);
        var sigma = parseFloat(ioValues.input[i].sigma);
        var T = parseFloat(ioValues.input[i].T);
        var q = parseFloat(ioValues.input[i].q);  // CALL = 1 PUT = -1

        var expected = parseFloat(ioValues.output[i].implied_volatility_from_a_transformed_rational_guess);
        var price = js_lets_be_rational.black(F, K, sigma, T, q);
        var actual = js_lets_be_rational.implied_volatility_from_a_transformed_rational_guess(price, F, K, T, q);

        almostEqual(actual, expected) ;
    }
});

QUnit.test("implied_volatility_from_a_transformed_rational_guess_with_limited_iterations", function () {
    for (var i = 0; i < TestCases; i++) {
        var F = parseFloat(ioValues.input[i].F);
        var K = parseFloat(ioValues.input[i].K);
        var sigma = parseFloat(ioValues.input[i].sigma);
        var T = parseFloat(ioValues.input[i].T);
        var q = parseFloat(ioValues.input[i].q);  // CALL = 1 PUT = -1
        var N = parseInt(ioValues.input[i].N);

        var expected = parseFloat(ioValues.output[i].implied_volatility_from_a_transformed_rational_guess_with_limited_iterations);
        var price = js_lets_be_rational.black(F, K, sigma, T, q);
        var actual = js_lets_be_rational.implied_volatility_from_a_transformed_rational_guess_with_limited_iterations(price, F, K, T, q, N);

        almostEqual(actual, expected);
    }
});

QUnit.test("normalised_black", function () {
    for (var i = 0; i < TestCases; i++) {
        var F = parseFloat(ioValues.input[i].F);
        var K = parseFloat(ioValues.input[i].K);
        var sigma = parseFloat(ioValues.input[i].sigma);
        var T = parseFloat(ioValues.input[i].T);
        var q = parseFloat(ioValues.input[i].q);  // CALL = 1 PUT = -1

        var x = parseFloat(ioValues.input[i].x);
        var s = parseFloat(ioValues.input[i].s);

        var expected = parseFloat(ioValues.output[i].normalised_black);
        var actual = js_lets_be_rational.normalised_black(x, s, q);

        almostEqual(actual, expected);
    }
});

QUnit.test("normalised_black_call", function () {
    for (var i = 0; i < TestCases; i++) {
        var F = parseFloat(ioValues.input[i].F);
        var K = parseFloat(ioValues.input[i].K);
        var sigma = parseFloat(ioValues.input[i].sigma);
        var T = parseFloat(ioValues.input[i].T);

        var x = parseFloat(ioValues.input[i].x);
        var s = parseFloat(ioValues.input[i].s);

        var expected = parseFloat(ioValues.output[i].normalised_black_call);
        var actual = js_lets_be_rational.normalised_black_call(x, s);

        almostEqual(actual, expected);
    }
});

QUnit.test("normalised_vega", function () {
    for (var i = 0; i < TestCases; i++) {
        var x = parseFloat(ioValues.input[i].x);
        var s = parseFloat(ioValues.input[i].s);

        var expected = parseFloat(ioValues.output[i].normalised_vega);
        var actual = js_lets_be_rational.normalised_vega(x, s);

        almostEqual(actual, expected);
    }
});

QUnit.test("normalised_implied_volatility_from_a_transformed_rational_guess", function () {
    for (var i = 0; i < TestCases; i++) {
        var F = parseFloat(ioValues.input[i].F);
        var K = parseFloat(ioValues.input[i].K);
        var sigma = parseFloat(ioValues.input[i].sigma);
        var T = parseFloat(ioValues.input[i].T);
        var q = parseFloat(ioValues.input[i].q);  // CALL = 1 PUT = -1

        var x = parseFloat(ioValues.input[i].x);
        var s = parseFloat(ioValues.input[i].s);

        var expected = parseFloat(ioValues.output[i].normalised_implied_volatility_from_a_transformed_rational_guess);
        var beta = js_lets_be_rational.normalised_black(x, s, q);
        var actual = js_lets_be_rational.normalised_implied_volatility_from_a_transformed_rational_guess(beta, x, q);

        almostEqual(actual, expected);
    }
});

QUnit.test("normalised_implied_volatility_from_a_transformed_rational_guess_with_limited_iterations", function () {
    for (var i = 0; i < TestCases; i++) {
        var F = parseFloat(ioValues.input[i].F);
        var K = parseFloat(ioValues.input[i].K);
        var sigma = parseFloat(ioValues.input[i].sigma);
        var T = parseFloat(ioValues.input[i].T);
        var q = parseFloat(ioValues.input[i].q);  // CALL = 1 PUT = -1
        var N = parseInt(ioValues.input[i].N);

        var x = parseFloat(ioValues.input[i].x);
        var s = parseFloat(ioValues.input[i].s);

        var expected = parseFloat(ioValues.output[i].normalised_implied_volatility_from_a_transformed_rational_guess_with_limited_iterations);
        var beta = js_lets_be_rational.normalised_black(x, s, q);
        var actual = js_lets_be_rational.normalised_implied_volatility_from_a_transformed_rational_guess_with_limited_iterations(beta, x, q, N);

        almostEqual(actual, expected);
    }
});

QUnit.test("norm_cdf", function () {
    for (var i = 0; i < TestCases; i++) {
        var z = parseFloat(ioValues.input[i].z);

        var expected = parseFloat(ioValues.output[i].norm_cdf);
        var actual = js_lets_be_rational.norm_cdf(z);

        almostEqual(actual, expected);
    }
});

