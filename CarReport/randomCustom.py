# Imports the monkeyrunner modules used by this program
from com.android.monkeyrunner import MonkeyRunner, MonkeyDevice
from random import randint


# Connects to the current device, returning a MonkeyDevice object
device = MonkeyRunner.waitForConnection()

# Installs the Android package. Notice that this method returns a boolean, so you can test
# to see if the installation worked.
device.installPackage('./me.kuehle.carreport_79.apk')

# sets a variable with the package's internal name
package = 'me.kuehle.carreport'

# sets a variable with the name of an Activity in the package
activity = 'me.kuehle.carreport.gui.MainActivity'

# sets the name of the component to start
runComponent = package + '/' + activity

# Runs the component
device.startActivity(component=runComponent)

#with your activity opened start your monkey test
print('start monkey test')
for i in range(1, 1000):
    #here i go emulate only simple touchs, but i can emulate swiper keyevents and more... :D
    device.touch(randint(0, 1000), randint(0, 800), 'DOWN_AND_UP')

print("end monkey test")

# Presses the Menu button
device.press('KEYCODE_MENU', MonkeyDevice.DOWN_AND_UP)

# Takes a screenshot
result = device.takeSnapshot()

# Writes the screenshot to a file
result.writeToFile('./shot1.png','png')