
class rationalcubic

    #-------nodejs---------
    if not DBL_EPSILON? and require?
        constants = require('constants.js')
        DBL_EPSILON = constants.DBL_EPSILON
        DBL_MAX = constants.DBL_MAX
        DBL_MIN = constants.DBL_MIN
    else
        constants = window.constants
    #-------------------#

    DBL_EPSILON = constants.DBL_EPSILON
    DBL_MAX = constants.DBL_MAX
    DBL_MIN = constants.DBL_MIN

    minimum_rational_cubic_control_parameter_value = -(1 - Math.sqrt(DBL_EPSILON))
    maximum_rational_cubic_control_parameter_value = 2 / (DBL_EPSILON * DBL_EPSILON)

    _is_zero = (x) ->
        return Math.abs(x) < DBL_MIN

    rational_cubic_control_parameter_to_fit_second_derivative_at_left_side: (x_l, x_r, y_l, y_r, d_l, d_r,
                                                                             second_derivative_l) ->
        h = (x_r - x_l)
        numerator = 0.5 * h * second_derivative_l + (d_r - d_l)
        if _is_zero(numerator)
            return 0
        denominator = (y_r - y_l) / h - d_l
        if _is_zero(denominator)
            return maximum_rational_cubic_control_parameter_value if numerator > 0
            else minimum_rational_cubic_control_parameter_value
        return numerator / denominator

    minimum_rational_cubic_control_parameter: (d_l, d_r, s, preferShapePreservationOverSmoothness) ->
        monotonic = d_l * s >= 0 and d_r * s >= 0
        convex = d_l <= s <= d_r
        concave = d_l >= s >= d_r
        if not monotonic and not convex and not concave  # If 3==r_non_shape_preserving_target, this means revert to standard cubic.
            return minimum_rational_cubic_control_parameter_value
        d_r_m_d_l = d_r - d_l
        d_r_m_s = d_r - s
        s_m_d_l = s - d_l
        r1 = -DBL_MAX
        r2 = r1
        # If monotonicity on this interval is possible, set r1 to satisfy the monotonicity condition (3.8).
        if monotonic
            if not _is_zero(s)  # (3.8), avoiding division by zero.
                r1 = (d_r + d_l) / s # (3.8)
            else if preferShapePreservationOverSmoothness  # If division by zero would occur, and shape preservation is preferred, set value to enforce linear interpolation.
                r1 = maximum_rational_cubic_control_parameter_value # This value enforces linear interpolation.

        if convex or concave
            if not (_is_zero(s_m_d_l) or _is_zero(d_r_m_s))  # (3.18), avoiding division by zero.
                r2 = Math.max(Math.abs(d_r_m_d_l / d_r_m_s), Math.abs(d_r_m_d_l / s_m_d_l))
            else if preferShapePreservationOverSmoothness
                r2 = maximum_rational_cubic_control_parameter_value # This value enforces linear interpolation.
        else if monotonic and preferShapePreservationOverSmoothness
            r2 = maximum_rational_cubic_control_parameter_value # This enforces linear interpolation along segments that are inconsistent with the slopes on the boundaries, e.g., a perfectly horizontal segment that has negative slopes on either edge.
        return Math.max(minimum_rational_cubic_control_parameter_value, Math.max(r1, r2))

    rational_cubic_control_parameter_to_fit_second_derivative_at_right_side: (
        x_l, x_r, y_l, y_r, d_l, d_r, second_derivative_r) ->
        h = (x_r - x_l)
        numerator = 0.5 * h * second_derivative_r + (d_r - d_l)
        if _is_zero(numerator)
            return 0
        denominator = d_r - (y_r - y_l) / h
        if _is_zero(denominator)
            return maximum_rational_cubic_control_parameter_value if numerator > 0
            else minimum_rational_cubic_control_parameter_value
        return numerator / denominator

    convex_rational_cubic_control_parameter_to_fit_second_derivative_at_right_side: (x_l, x_r, y_l, y_r, d_l, d_r, second_derivative_r,
                                                                                     preferShapePreservationOverSmoothness) ->
        r = @.rational_cubic_control_parameter_to_fit_second_derivative_at_right_side(
            x_l, x_r, y_l, y_r, d_l, d_r, second_derivative_r)
        r_min = @.minimum_rational_cubic_control_parameter d_l, d_r, (y_r - y_l) / (x_r - x_l), preferShapePreservationOverSmoothness
        return Math.max(r, r_min)


    rational_cubic_interpolation: (x, x_l, x_r, y_l, y_r, d_l, d_r, r) ->
        h = (x_r - x_l)
        if Math.abs(h) <= 0
            return 0.5 * (y_l + y_r)
        # r should be greater than -1. We do not use  assert(r > -1)  here in order to allow values such as NaN to be propagated as they should.
        t = (x - x_l) / h
        if r < maximum_rational_cubic_control_parameter_value
            t = (x - x_l) / h
            omt = 1 - t
            t2 = t * t
            omt2 = omt * omt
            # Formula (2.4) divided by formula (2.5)
            return (y_r * t2 * t + (r * y_r - h * d_r) * t2 * omt + (r * y_l + h * d_l) * t * omt2 + y_l * omt2 * omt) / (1 + (r - 3) * t * omt)

        # Linear interpolation without over-or underflow.
        return y_r * t + y_l * (1 - t)


    convex_rational_cubic_control_parameter_to_fit_second_derivative_at_left_side: (x_l, x_r, y_l, y_r, d_l, d_r, second_derivative_l, preferShapePreservationOverSmoothness) ->
        r = @.rational_cubic_control_parameter_to_fit_second_derivative_at_left_side x_l, x_r, y_l, y_r, d_l, d_r, second_derivative_l
        r_min = @.minimum_rational_cubic_control_parameter d_l, d_r, (y_r - y_l) / (x_r - x_l), preferShapePreservationOverSmoothness
        return Math.max(r, r_min)

if module?
    module.exports = new rationalcubic()
window.rationalcubic = new rationalcubic()
