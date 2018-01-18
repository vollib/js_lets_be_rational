QUnit.module("Basic Tests");

function almostEqualE12(actual, expected) {
    QUnit.assert.ok(Math.abs(actual - expected) < 1.0e-12, "Expected: ".concat(expected, "\nActual: ", actual));
}

QUnit.test("black", function () {
    var F = 100;
    var K = 100;
    var sigma = 0.2;
    var T = 0.5;
    var q = 1;  // CALL = 1 PUT = -1

    var actual = js_lets_be_rational.black(F, K, sigma, T, q);
    var expected = 5.637197779701664;

    almostEqualE12(actual, expected);
});

QUnit.test("implied_volatility_from_a_transformed_rational_guess", function () {
    var F = 100;
    var K = 100;
    var sigma = 0.2;
    var T = 0.5;
    var q = 1;  // CALL = 1 PUT = -1

    var price = 5.637197779701664;
    var actual = js_lets_be_rational.implied_volatility_from_a_transformed_rational_guess(price, F, K, T, q);
    var expected = 0.2;

    almostEqualE12(actual, expected);
});

QUnit.test("implied_volatility_from_a_transformed_rational_guess_with_limited_iterations", function () {
    var F = 100;
    var K = 100;
    var sigma = 0.232323232;
    var T = 0.5;
    var q = 1;  // CALL = 1 PUT = -1
    var N = 1;

    var price = 6.54635543387;
    var actual = js_lets_be_rational.implied_volatility_from_a_transformed_rational_guess_with_limited_iterations(price, F, K, T, q, N);
    var expected = 0.232323232;

    almostEqualE12(actual, expected);
});

QUnit.test("normalised_black", function () {
    var F = 100;
    var K = 95;
    var T = 0.5;
    var sigma = 0.3;

    var x = Math.log(F / K);
    var s = sigma * Math.sqrt(T);

    var q = -1;  // CALL = 1 PUT = -1
    var actual_put = js_lets_be_rational.normalised_black(x, s, q);
    var expected_put = 0.061296663817558904;

    almostEqualE12(expected_put, actual_put);

    q = 1;  // CALL = 1 PUT = -1
    var actual_call = js_lets_be_rational.normalised_black(x, s, q);
    var expected_call = 0.11259558142181655;

    almostEqualE12(expected_call, actual_call);
});

QUnit.test("normalised_black_call", function () {
    var F = 100;
    var K = 95;
    var T = 0.5;
    var sigma = 0.3;

    var x = Math.log(F / K);
    var s = sigma * Math.sqrt(T);

    var actual = js_lets_be_rational.normalised_black_call(x, s);
    var expected = 0.11259558142181655;

    almostEqualE12(actual, expected);
});

QUnit.test("normalised_vega", function () {
    var x = 0.0;
    var s = 0.0;
    var actual = js_lets_be_rational.normalised_vega(x, s);
    var expected = 0.3989422804014327;
    almostEqualE12(actual, expected);

    x = 0.0;
    s = 2.937528694999807;
    actual = js_lets_be_rational.normalised_vega(x, s);
    expected = 0.13566415614561067;
    almostEqualE12(actual, expected);

    x = 0.0;
    s = 0.2;
    actual = js_lets_be_rational.normalised_vega(x, s);
    expected = 0.3969525474770118;
    almostEqualE12(actual, expected);
});

QUnit.test("normalised_implied_volatility_from_a_transformed_rational_guess", function () {
    var x = 0.0;
    var s = 0.2;
    var q = 1;  // CALL = 1 PUT = -1
    var beta_call = js_lets_be_rational.normalised_black(x, s, q);
    var actual = js_lets_be_rational.normalised_implied_volatility_from_a_transformed_rational_guess(beta_call, x, q);
    var expected = 0.2;
    almostEqualE12(actual, expected);

    x = 0.1;
    s = 0.23232323888;
    q = -1;  // CALL = 1 PUT = -1
    var beta_put = js_lets_be_rational.normalised_black(x, s, q);
    actual = js_lets_be_rational.normalised_implied_volatility_from_a_transformed_rational_guess(beta_put, x, q);
    expected = 0.23232323888;
    almostEqualE12(actual, expected);
});

QUnit.test("normalised_implied_volatility_from_a_transformed_rational_guess_with_limited_iterations", function () {
    var x = 0.0;
    var s = 0.2;
    var q = 1;  // CALL = 1 PUT = -1
    var N = 1;
    var beta_call = js_lets_be_rational.normalised_black(x, s, q);
    var actual = js_lets_be_rational.normalised_implied_volatility_from_a_transformed_rational_guess_with_limited_iterations(beta_call, x, q, N);
    var expected = 0.2;
    almostEqualE12(actual, expected);

    x = 0.1;
    s = 0.23232323888;
    q = -1;  // CALL = 1 PUT = -1
    N = 1;
    var beta_put = js_lets_be_rational.normalised_black(x, s, q);
    actual = js_lets_be_rational.normalised_implied_volatility_from_a_transformed_rational_guess_with_limited_iterations(beta_put, x, q, N);
    expected = 0.23232323888;
    almostEqualE12(actual, expected);
});

QUnit.test("norm_cdf", function () {
    var z = 0.302569738839;
    var actual = js_lets_be_rational.norm_cdf(z);
    var expected = 0.618891110513;
    almostEqualE12(actual, expected);

    z = 0.161148382602;
    actual = js_lets_be_rational.norm_cdf(z);
    expected = 0.564011732814;
    almostEqualE12(actual, expected);
});

QUnit.module("Volatility Value Error Tests");

QUnit.test("test_below_intrinsic_volatility_error", function(){
    var F = 100;
    var K = 100;
    var T = 0.5;
    var q = 1;

    QUnit.assert.throws(
        function() {
            var price = -1.0;
            js_lets_be_rational.implied_volatility_from_a_transformed_rational_guess(price, F, K, T, q);
        }, function(error) {
            return error instanceof VolatilityValueError
                && error instanceof BelowIntrinsicError
                && !(error instanceof AboveMaximumError)
        }
    );

    QUnit.assert.throws(
        function() {
            var beta = 0.2;
            var x = Math.log(300 / 100);
            js_lets_be_rational.normalised_implied_volatility_from_a_transformed_rational_guess(beta, x, q);
        }, function(error) {
            return error instanceof VolatilityValueError
                && error instanceof BelowIntrinsicError
                && !(error instanceof AboveMaximumError)
        }
    );
});

QUnit.test("test_above_maximum_volatility_error", function(){
    var F = 100;
    var K = 100;
    var T = 0.5;
    var q = 1;

    QUnit.assert.throws(
        function() {
            var price = 200;
            js_lets_be_rational.implied_volatility_from_a_transformed_rational_guess(price, F, K, T, q);
        }, function(error) {
            return error instanceof VolatilityValueError
                && error instanceof AboveMaximumError
                && !(error instanceof BelowIntrinsicError)
        }
    );

    QUnit.assert.throws(
        function() {
            var beta = 200;
            var x = Math.log(300 / 100);
            js_lets_be_rational.normalised_implied_volatility_from_a_transformed_rational_guess(beta, x, q);
        }, function(error) {
            return error instanceof VolatilityValueError
                && error instanceof AboveMaximumError
                && !(error instanceof BelowIntrinsicError)
        }
    );
});