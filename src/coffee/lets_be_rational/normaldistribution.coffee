
class normaldistribution

    #-------nodejs---------
    if not DBL_EPSILON? and require?
        erf_cody = require('erf_cody')
        constants = require('constants')
    else
        erf_cody = window.erf_cody
        constants = window.constants
    #-------------------#

    DBL_EPSILON = constants.DBL_EPSILON
    DBL_MAX = constants.DBL_MAX
    ONE_OVER_SQRT_TWO_PI = constants.ONE_OVER_SQRT_TWO_PI
    ONE_OVER_SQRT_TWO = constants.ONE_OVER_SQRT_TWO

    # The asymptotic expansion  Φ(z) = φ(z)/|z|·[1-1/z^2+...],  Abramowitz & Stegun (26.2.12), suffices for Φ(z) to have
    # relative accuracy of 1.64E-16 for z<=-10 with 17 terms inside the square brackets (not counting the leading 1).
    # This translates to a maximum of about 9 iterations below, which is competitive with a call to erfc() and never
    # less accurate when z<=-10. Note that, as mentioned in section 4 (and discussion of figures 2 and 3) of George
    # Marsaglia's article "Evaluating the Normal Distribution" (available at http:#www.jstatsoft.org/v11/a05/paper),
    # for values of x approaching -8 and below, the error of any cumulative normal function is actually dominated by
    # the hardware (or compiler implementation) accuracy of exp(-x²/2) which is not reliably more than 14 digits when
    # x becomes large. Still, we should switch to the asymptotic only when it is beneficial to do so.

    norm_cdf_asymptotic_expansion_first_threshold = -10.0
    norm_cdf_asymptotic_expansion_second_threshold = -1 / Math.sqrt(DBL_EPSILON)

    #
    # ALGORITHM AS241  APPL. STATIST. (1988) VOL. 37, NO. 3
    #
    # Produces the normal deviate Z corresponding to a given lower
    # tail area of u Z is accurate to about 1 part in 10**16.
    # see http:#lib.stat.cmu.edu/apstat/241
    #
    split1 = 0.425
    split2 = 5.0
    const1 = 0.180625
    const2 = 1.6

    # Coefficients for P close to 0.5
    A0 = 3.3871328727963666080e0
    A1 = 1.3314166789178437745e+2
    A2 = 1.9715909503065514427e+3
    A3 = 1.3731693765509461125e+4
    A4 = 4.5921953931549871457e+4
    A5 = 6.7265770927008700853e+4
    A6 = 3.3430575583588128105e+4
    A7 = 2.5090809287301226727e+3
    B1 = 4.2313330701600911252e+1
    B2 = 6.8718700749205790830e+2
    B3 = 5.3941960214247511077e+3
    B4 = 2.1213794301586595867e+4
    B5 = 3.9307895800092710610e+4
    B6 = 2.8729085735721942674e+4
    B7 = 5.2264952788528545610e+3
    # Coefficients for P not close to 0, 0.5 or 1.
    C0 = 1.42343711074968357734e0
    C1 = 4.63033784615654529590e0
    C2 = 5.76949722146069140550e0
    C3 = 3.64784832476320460504e0
    C4 = 1.27045825245236838258e0
    C5 = 2.41780725177450611770e-1
    C6 = 2.27238449892691845833e-2
    C7 = 7.74545014278341407640e-4
    D1 = 2.05319162663775882187e0
    D2 = 1.67638483018380384940e0
    D3 = 6.89767334985100004550e-1
    D4 = 1.48103976427480074590e-1
    D5 = 1.51986665636164571966e-2
    D6 = 5.47593808499534494600e-4
    D7 = 1.05075007164441684324e-9
    # Coefficients for P very close to 0 or 1
    E0 = 6.65790464350110377720e0
    E1 = 5.46378491116411436990e0
    E2 = 1.78482653991729133580e0
    E3 = 2.96560571828504891230e-1
    E4 = 2.65321895265761230930e-2
    E5 = 1.24266094738807843860e-3
    E6 = 2.71155556874348757815e-5
    E7 = 2.01033439929228813265e-7
    F1 = 5.99832206555887937690e-1
    F2 = 1.36929880922735805310e-1
    F3 = 1.48753612908506148525e-2
    F4 = 7.86869131145613259100e-4
    F5 = 1.84631831751005468180e-5
    F6 = 1.42151175831644588870e-7
    F7 = 2.04426310338993978564e-15

    norm_pdf: (x) ->
        return ONE_OVER_SQRT_TWO_PI * Math.exp(-0.5 * x * x)

    norm_cdf: (z) ->
        if z <= norm_cdf_asymptotic_expansion_first_threshold
            # Asymptotic expansion for very negative z following (26.2.12) on page 408
            # in M. Abramowitz and A. Stegun, Pocketbook of Mathematical Functions, ISBN 3-87144818-4.
            sum = 1
            if z >= norm_cdf_asymptotic_expansion_second_threshold
                zsqr = z * z
                i = 1
                g = 1
                x = 0
                y = 0
                a = DBL_MAX

                lasta = a
                x = (4 * i - 3) / zsqr
                y = x * ((4 * i - 1) / zsqr)
                a = g * (x - y)
                sum -= a
                g *= y
                i += 1
                a = Math.abs(a)
                while lasta > a >= Math.abs(sum * DBL_EPSILON)
                    lasta = a
                    x = (4 * i - 3) / zsqr
                    y = x * ((4 * i - 1) / zsqr)
                    a = g * (x - y)
                    sum -= a
                    g *= y
                    i += 1
                    a = Math.abs(a)
            return -@.norm_pdf(z) * sum / z
        return 0.5 * erf_cody.erfc_cody(-z * ONE_OVER_SQRT_TWO)

    inverse_norm_cdf: (u) ->
        #
        # ALGORITHM AS241  APPL. STATIST. (1988) VOL. 37, NO. 3
        #
        # Produces the normal deviate Z corresponding to a given lower
        # tail area of u Z is accurate to about 1 part in 10**16.
        # see http:#lib.stat.cmu.edu/apstat/241
        #
        if u <= 0
            return Math.log(u)
        if u >= 1
            return Math.log(1 - u)

        q = u - 0.5
        if Math.abs(q) <= split1
            r = const1 - q * q
            return q * (((((((A7 * r + A6) * r + A5) * r + A4) * r + A3) * r + A2) * r + A1) * r + A0) \
                   / (((((((B7 * r + B6) * r + B5) * r + B4) * r + B3) * r + B2) * r + B1) * r + 1.0)

        else
            r = if q < 0.0 then u else 1.0 - u
            r = Math.sqrt(-Math.log(r))
            if r < split2
                r -= const2
                ret = (((((((C7 * r + C6) * r + C5) * r + C4) * r + C3) * r + C2) * r + C1) * r + C0) \
                      / (((((((D7 * r + D6) * r + D5) * r + D4) * r + D3) * r + D2) * r + D1) * r + 1.0)

            else
                r -= split2
                ret = (((((((E7 * r + E6) * r + E5) * r + E4) * r + E3) * r + E2) * r + E1) * r + E0) \
                      / (((((((F7 * r + F6) * r + F5) * r + F4) * r + F3) * r + F2) * r + F1) * r + 1.0)

            return if q < 0.0 then -ret else ret

if module?
    module.exports = new normaldistribution()
window.normaldistribution = new normaldistribution()
