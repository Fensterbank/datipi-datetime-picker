DaTiPi
==================

*A simple date & time picker using plain JavaScript*

## Description
DaTiPi (**Da**te **Ti**me **Pi**cker) is a simple and fast picker for date and time selection.

I created this thing after I searched a small picker library and get sick by the mass of pickers using jQuery, Prototype or other bloatware.

In times when people including jQuery only to find an element by tag name, there is a need for small datetime picker like DaTiPi, which only dependency are the fast and awesome technologies JavaScript and Cascading Style Sheet (CSS).

* A date is selected by using a small intuitive month view.
* A time is selected by using a clock style selection field.

## Example ##
A working example can be found here: [datipi.bolvin.de](http://datipi.bolvin.de)

## Browser Support ##
DaTiPi is tested in Mozilla Firefox, Google Chrome and Internet Explorer 9, 10 and 11.
It should work in most modern browser. Older browsers than IE9 are not supported.

## Usage
Include the script and css file in the head

### Method 1: Auto create picker by class ###
Create input elements with the class 'datipi'.

A DaTiPi instance is created for each input field with the class after DOM is ready.

### Method 2: Initialize picker by code ###
    var myField = document.getElementById('datetime');
    var myPicker = new DATIPI(myField);

## License

Licensed under the MIT License.
