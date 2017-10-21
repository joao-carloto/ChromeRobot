Chrome Robot
=========

WHAT IS CHROME ROBOT?

Chrome Robot is a Chrome Dev Tools extension that allows you to create Robot Framework/Selenium tests, in a more efficient way.
Check the demonstration videos on YouTube or keep reading. The videos below are from Fire Robot, a similar application for Firefox, from the same author. Most functionalities are identical, with a few exceptions.
<ul>
<li><a href='http://youtu.be/uzRwY6xkTC0' target='_blank'>Generic demonstration</a></li>
<li><a href='https://www.youtube.com/watch?v=-yNYXSyOCKg' target='_blank'>Keyword extraction</a></li>
</ul>

Keyword driven testing is in the far end of the spectrum from record and play tools, as far as test automation concerns. 
Although this tool has some features in common with record and play tools, it's interest lies in some specific features that will help you to create high level custom keywords, based on the Selenium2library:
- Bulk selection of elements and creation of test steps in an adaptative way.
- Filling and verification of forms based on their current state.
- Easy preference definition for the page element locators.
- Element localization thru automatically generated XPath, based on an element's own text or text of a nearby element.
- Automatic creation of variables based on the value of inputs.


HOW TO INSTALL CHROME ROBOT?

- Get it from the chrome app store, once it's available (TODO), or just download the code here and use it as an unpacked extension.
- Chrome Robot is a Dev Tools extension (Ctrl + Shift + I).You can find all functionalities on the respective Dev Tools tab.
- You may reposition the tab for ease of use.


HOW TO USE CHROME ROBOT?
- Open the Dev Tools Chrome Robot tab.
- Toggle the select button (shortcut keys Shift + Alt + Z).
- The active web page will get a dashed border, along with any included frames or iframes.
- Click to select page elements of interest.
- Right-click the page under testing to access the keyword context menu.
- Select the menu options and test steps will be added.
- Use the ESC key to clear the selections, while keeping the selection mode on.
- To fill and check forms you may select any element that includes the form elements of interest, not necessarily the form element.
- For iframe related keywords you may select any element inside the iframe.
- Use the preferences window to change the locator preferences and the options for variable creation and usage.
- You may select a group of test steps and automatically convert them to a new keyword.
- You may select resource files and automatically add its path to the *Settings* section.
- You may download the generated test script to your machine and run it directly or incorporate the code on some project. You must have the <a href='http://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html#installation-instructions' target='_blank'>Robot Framework</a> and the <a href='https://github.com/rtomac/robotframework-selenium2library#installation' target='_blank'>Selenium2Library</a> installed. To help the installation you might want to use this <a href='http://joao-carloto.github.io/RF_Install_Script/' target='_blank'>script</a>.


Disclaimer: This tool is being released publicly because it is believed to have reached a stage where it can be helpful. However, most of it was written when the author should be sleeping, and it was not submitted to exhaustive testing.
If you feel this project might be helpful to you, please contribute by providing feedback <a href='https://github.com/joao-carloto/ChromeRobot/issues' target='_blank'>here</a> . 
Bugs, new features, small improvements, all are welcome. They will be addressed when possible.
