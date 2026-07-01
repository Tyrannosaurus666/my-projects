class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return "Some sound"

    def move(self):
        return f"{self.name} is moving"

class Dog(Animal):
    def speak(self):
        return "Woof!"

    def fetch(self):
        return f"{self.name} is fetching the ball"

class Cat(Animal):
    def speak(self):
        return "Meow!"

    def climb(self):
        return f"{self.name} is climbing a tree"

class Bird(Animal):
    def __init__(self, name, can_fly=True):
        super().__init__(name)
        self.can_fly = can_fly

    def speak(self):
        return "Chirp!"

    def move(self):
        if self.can_fly:
            return f"{self.name} is flying"
        return f"{self.name} is walking"

animals = [Dog("Buddy"), Cat("Kitty"), Bird("Tweety")]
for a in animals:
    print(f"{a.name}: {a.speak()} - {a.move()}")
