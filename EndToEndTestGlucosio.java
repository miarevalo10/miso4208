package org.glucosio.android.activity;


import android.support.test.espresso.ViewInteraction;
import android.support.test.filters.LargeTest;
import android.support.test.rule.ActivityTestRule;
import android.support.test.runner.AndroidJUnit4;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import org.glucosio.android.R;
import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.hamcrest.core.IsInstanceOf;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import static android.support.test.espresso.Espresso.onView;
import static android.support.test.espresso.action.ViewActions.click;
import static android.support.test.espresso.action.ViewActions.closeSoftKeyboard;
import static android.support.test.espresso.action.ViewActions.replaceText;
import static android.support.test.espresso.action.ViewActions.scrollTo;
import static android.support.test.espresso.assertion.ViewAssertions.matches;
import static android.support.test.espresso.contrib.RecyclerViewActions.actionOnItemAtPosition;
import static android.support.test.espresso.matcher.ViewMatchers.isDisplayed;
import static android.support.test.espresso.matcher.ViewMatchers.withClassName;
import static android.support.test.espresso.matcher.ViewMatchers.withContentDescription;
import static android.support.test.espresso.matcher.ViewMatchers.withId;
import static android.support.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.is;

@LargeTest
@RunWith(AndroidJUnit4.class)
public class EndToEndTest {

    @Rule
    public ActivityTestRule<SplashActivity> mActivityTestRule = new ActivityTestRule<>(SplashActivity.class);

    @Test
    public void endToEndTest() {
        waitNextScreen();

        //Dismiss initial analytics dialog
        onView(withId(android.R.id.button1)).perform(scrollTo(), click());

        onView(withId(R.id.activity_hello_title)).check(matches(isDisplayed()));

        //Tap on the age field
        onView(withId(R.id.activity_hello_age)).perform(click());

        //Type 23 on the age field
        onView(withId(R.id.activity_hello_age)).perform(replaceText("23"), closeSoftKeyboard());

        //Click on text "Start" to pass to the main activity
        onView(withId(R.id.activity_hello_button_start)).perform(scrollTo(), click());

        waitNextScreen();

        //Empty activity text is displayed
        onView(withId(R.id.activity_main_empty)).check(matches(isDisplayed()));

        //Click on floating button
        onView(withId(R.id.activity_main_fab_add_reading)).perform(click());

        //Find button on the bottom sheet and do click
        ViewInteraction linearLayout = onView(
                allOf(childAtPosition(
                        childAtPosition(
                                withId(R.id.activity_main_add_bottom_sheet_menu),
                                1),
                        0),
                        isDisplayed()));
        linearLayout.perform(click());

        waitNextScreen();

        //Fill field of concentration
        onView(withId(R.id.glucose_add_concentration)).perform(replaceText("25"));

        //Fill notes field
        onView(withId(R.id.glucose_add_notes)).perform(replaceText("Ejemplo de nota"));

        //Click on done button
        onView(withId(R.id.done_fab)).perform(scrollTo(), click());

        waitNextScreen();

        charIsDisplayedAndClickFloatingButton();

        //Find button on the bottom sheet and do click
        ViewInteraction linearLayout2 = onView(
                allOf(childAtPosition(
                        childAtPosition(
                                withId(R.id.activity_main_add_bottom_sheet_menu),
                                1),
                        1),
                        isDisplayed()));
        linearLayout2.perform(click());

        waitNextScreen();

        //Fill hb1ac value
        onView(withId(R.id.hb1ac_add_value)).perform(replaceText("12"), closeSoftKeyboard());

        //Click on done button
        onView(withId(R.id.done_fab)).perform(scrollTo(), click());

        waitNextScreen();

        charIsDisplayedAndClickFloatingButton();

        //Find button on the bottom sheet and do click
        ViewInteraction linearLayout3 = onView(
                allOf(childAtPosition(
                        childAtPosition(
                                withId(R.id.activity_main_add_bottom_sheet_menu),
                                1),
                        2),
                        isDisplayed()));
        linearLayout3.perform(click());

        waitNextScreen();

        //Fill weight value
        onView(withId(R.id.weight_add_value)).perform(replaceText("75"), closeSoftKeyboard());

        //Click on done button
        onView(withId(R.id.done_fab)).perform(scrollTo(), click());

        waitNextScreen();

        charIsDisplayedAndClickFloatingButton();

        //Find button on the bottom sheet and do click
        ViewInteraction linearLayout4 = onView(
                allOf(childAtPosition(
                        childAtPosition(
                                withId(R.id.activity_main_add_bottom_sheet_menu),
                                2),
                        0),
                        isDisplayed()));
        linearLayout4.perform(click());

        waitNextScreen();

        //Fill maximun pressure value
        onView(withId(R.id.pressure_add_value_max)).perform(replaceText("80"), closeSoftKeyboard());

        //Fill minimun pressure value
        onView(withId(R.id.pressure_add_value_min)).perform(replaceText("60"), closeSoftKeyboard());

        //Click on done button
        onView(withId(R.id.done_fab)).perform(scrollTo(), click());

        waitNextScreen();

        charIsDisplayedAndClickFloatingButton();

        //Find button on the bottom sheet and do click
        ViewInteraction linearLayout5 = onView(
                allOf(childAtPosition(
                        childAtPosition(
                                withId(R.id.activity_main_add_bottom_sheet_menu),
                                2),
                        1),
                        isDisplayed()));
        linearLayout5.perform(click());

        waitNextScreen();

        //Fill ketone value
        onView(withId(R.id.ketone_add_value)).perform(replaceText("123"), closeSoftKeyboard());

        //Click on done button
        onView(withId(R.id.done_fab)).perform(scrollTo(), click());

        waitNextScreen();

        charIsDisplayedAndClickFloatingButton();

        //Find button on the bottom sheet and do click
        ViewInteraction linearLayout6 = onView(
                allOf(childAtPosition(
                        childAtPosition(
                                withId(R.id.activity_main_add_bottom_sheet_menu),
                                2),
                        2),
                        isDisplayed()));
        linearLayout6.perform(click());

        waitNextScreen();

        onView(withId(R.id.cholesterol_add_value_total)).perform(replaceText("100"), closeSoftKeyboard());

        onView(withId(R.id.cholesterol_add_value_ldl)).perform(replaceText("50"), closeSoftKeyboard());

        onView(withId(R.id.cholesterol_add_value_hdl)).perform(replaceText("50"), closeSoftKeyboard());

        //Click on done button
        onView(withId(R.id.done_fab)).perform(scrollTo(), click());

        waitNextScreen();

        //Chart is displayed
        onView(withId(R.id.chart)).check(matches(isDisplayed()));

        openSidebarAndClickAtPosition(1);

        waitNextScreen();

        //Fill field to calculate
        onView(withId(R.id.activity_converter_a1c_glucose)).perform(scrollTo(), replaceText("25"), closeSoftKeyboard());

        //Check that calculation is correct
        onView(withId(R.id.activity_converter_a1c_a1c)).check(matches(withText("2,5")));

        //Save value
        onView(withId(R.id.action_menu_save)).perform(click());

        waitNextScreen();

        //Chart is displayed
        onView(withId(R.id.chart)).check(matches(isDisplayed()));

        openSidebarAndClickAtPosition(2);

        waitNextScreen();

        onView(withId(R.id.activity_reminders_listview_empty)).check(matches(isDisplayed()));

        onView(withId(R.id.activity_reminders_fab_add)).perform(click());

        ViewInteraction editText = onView(
                allOf(childAtPosition(
                        allOf(withId(R.id.custom),
                                childAtPosition(
                                        withId(R.id.customPanel),
                                        0)),
                        0),
                        isDisplayed()));
        editText.perform(click());

        ViewInteraction editText2 = onView(
                allOf(childAtPosition(
                        allOf(withId(R.id.custom),
                                childAtPosition(
                                        withId(R.id.customPanel),
                                        0)),
                        0),
                        isDisplayed()));
        editText2.perform(replaceText("reminder"), closeSoftKeyboard());

        ViewInteraction appCompatButton3 = onView(
                allOf(withId(android.R.id.button1), withText("OK"),
                        childAtPosition(
                                childAtPosition(
                                        withId(R.id.buttonPanel),
                                        0),
                                3)));
        appCompatButton3.perform(scrollTo(), click());

        ViewInteraction appCompatButton4 = onView(
                allOf(withId(android.R.id.button1), withText("OK"),
                        childAtPosition(
                                childAtPosition(
                                        withClassName(is("android.widget.ScrollView")),
                                        0),
                                3)));
        appCompatButton4.perform(scrollTo(), click());

        ViewInteraction textView10 = onView(
                allOf(withId(R.id.activity_reminders_label), withText("reminder"),
                        childAtPosition(
                                childAtPosition(
                                        IsInstanceOf.<View>instanceOf(android.widget.LinearLayout.class),
                                        0),
                                1),
                        isDisplayed()));
        textView10.check(matches(withText("reminder")));
    }

    private static Matcher<View> childAtPosition(
            final Matcher<View> parentMatcher, final int position) {

        return new TypeSafeMatcher<View>() {
            @Override
            public void describeTo(Description description) {
                description.appendText("Child at position " + position + " in parent ");
                parentMatcher.describeTo(description);
            }

            @Override
            public boolean matchesSafely(View view) {
                ViewParent parent = view.getParent();
                return parent instanceof ViewGroup && parentMatcher.matches(parent)
                        && view.equals(((ViewGroup) parent).getChildAt(position));
            }
        };
    }

    private void waitNextScreen(){
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private void charIsDisplayedAndClickFloatingButton(){
        //Chart is displayed
        onView(withId(R.id.chart)).check(matches(isDisplayed()));

        //Click on floating button
        onView(withId(R.id.activity_main_fab_add_reading)).perform(click());
    }

    private void openSidebarAndClickAtPosition(int position){
        ViewInteraction appCompatImageButton2 = onView(
                allOf(withContentDescription("Open"),
                        childAtPosition(
                                allOf(withId(R.id.activity_main_toolbar),
                                        childAtPosition(
                                                withId(R.id.activity_main_appbar_layout),
                                                0)),
                                1),
                        isDisplayed()));
        appCompatImageButton2.perform(click());

        ViewInteraction recyclerView = onView(
                allOf(withId(R.id.material_drawer_recycler_view),
                        childAtPosition(
                                withId(R.id.material_drawer_slider_layout),
                                1)));
        recyclerView.perform(actionOnItemAtPosition(position, click()));
    }
}
