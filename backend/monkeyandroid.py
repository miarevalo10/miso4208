import random
from com.android.monkeyrunner import MonkeyRunner, MonkeyDevice

# sets a variable with the package's internal name
package = 'com.example.android.myapplication'

# sets a variable with the name of an Activity in the package
activity = 'com.example.android.myapplication.MainActivity'

print "Seed: ", sys.argv[0]
print "Number of events", sys.argv[1]

random.seed(sys.argv[0])

device = MonkeyRunner.waitForConnection()
device.installPackage('myproject/bin/car.apk')
runComponent = package + '/' + activity
device.startActivity(component=runComponent)
width = device.getProperty('display.width')
height = device.getProperty('display.height')
for x in range(0, sys.argv[1]):
    
    event=random.randint(0,10)
    across = random.randint(0,width-1)
    vertical = random.randint(0,height-1)

    switch (event) {
    
    
    device.touch(200,200, 'DOWN_AND_UP')
            case 1:  device.press('KEYCODE_DPAD_DOWN')
                     break;
            case 2:  device.press('KEYCODE_DPAD_CENTER')
                     break;
            case 3:  device.touch(across,vertical, 'DOWN_AND_UP')
                     break;
            case 4:  device.touch(across,vertical, 'DOWN')
                     break;
            case 5:  device.touch(across,vertical, 'UP')
                    break;
            case 6:  device.type("qywtep./=;'][das")
                    break;
            case 7:  device.type("1564621")
                    break;
            case 8:  device.type("./;',.;/][,.")
                    break;
            case 9:  device.type("safdsdfsdafdsf")
                    break;
            case 10:  device.type("54*/- asdasf")
                    break;

            time.sleep(0.1) 
        }

    filename = "screenshot-" + str(x) + ".png"
    screenshot = device.takeSnapshot()
    screenshot.writeToFile(filename,"png")
    