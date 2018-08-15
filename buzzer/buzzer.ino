#include <Keyboard.h>

int buttonPin = 5;
char buttonKey = 'g';

boolean readButton(int pin) {
  // check and debounce buttons
  if (digitalRead(pin) == HIGH) {
    delay(10);
    if (digitalRead(pin) == HIGH) {
      return true;
    }
  }
  return false;
}

void setup() {
  Keyboard.begin();
  pinMode(buttonPin, INPUT);
}

void loop() {
  if (readButton(buttonPin)) {
    Keyboard.press(buttonKey);
    delay(100);
    Keyboard.releaseAll();
  }
}
