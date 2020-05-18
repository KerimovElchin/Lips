## AR Makeup. Lips.  
![Background image](/LipsProject.png)
## Puprose
This project changes an image with adding chosen colour to the lips by face detection.
The project allows to try on a lipstick before buying it.
It is designed to use predefined photos or loading images optionally.
## Limitations
The project is designed only for educational goals therefore it might be such problem as delay or an unlikelihood of shades.
## Prerequisites
It requires NodeJS, Browser.
## Additional information
An original description of the project is here http://www.d-inter.ru/private/Vlad/js/task_ar_makeover_lips.html
##Testing
+ In directory `/test/models` you can find models for recognize lips
+ In directory `/test/photos` you can see all photos for testing

For start test run command
``npm test`` this command run ``mocha --timeout 20000`` from package.json.

If you want set more time for timeout, you should edit test field in package.json in block scripts. 