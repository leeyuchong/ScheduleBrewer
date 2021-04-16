import random

def get_random():
    chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)'
    return ''.join(random.choice(chars) for _ in range(50))

print(get_random())