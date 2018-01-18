class VolatilityValueError
  constructor: (message, value) ->
    @name = @constructor.name
    @message = message
    @value = value
    @stack = (new Error).stack

  @:: = new Error
  @::constructor = @


class BelowIntrinsicError extends VolatilityValueError
  constructor: -> super 'The volatility is below the intrinsic value.', constants.VOLATILITY_VALUE_TO_SIGNAL_PRICE_IS_BELOW_INTRINSIC

class AboveMaximumError extends VolatilityValueError
  constructor: -> super 'The volatility is above the maximum value.', constants.VOLATILITY_VALUE_TO_SIGNAL_PRICE_IS_ABOVE_MAXIMUM