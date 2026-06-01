def karatsuba(x, y):
    if x < 10 or y < 10:
        return x * y

    n = max(len(str(x)), len(str(y)))
    m = n // 2

    high_x, low_x = divmod(x, 10**m)
    high_y, low_y = divmod(y, 10**m)

    z0 = karatsuba(low_x, low_y)
    z2 = karatsuba(high_x, high_y)
    z1 = karatsuba(low_x + high_x, low_y + high_y) - z2 - z0

    return z2 * 10**(2*m) + z1 * 10**m + z0


def naive_multiply(x, y):
    if x == 0 or y == 0:
        return 0

    result = 0
    multiplier = 1

    temp_y = y
    while temp_y > 0:
        digit = temp_y % 10
        partial = 0
        temp_x = x
        carry = 0
        pos = multiplier

        digits_x = []
        while temp_x > 0:
            digits_x.append(temp_x % 10)
            temp_x //= 10

        partial_sum = 0
        for i, dx in enumerate(digits_x):
            partial_sum += dx * digit * (10 ** i)

        result += partial_sum * multiplier
        multiplier *= 10
        temp_y //= 10

    return result
