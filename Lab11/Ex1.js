step1=99;
step2=parseInt(step1/4);
step3 = step2 + step1;
step4 = 3; // Not Jan, so look at month before on table
step6 = step4 + step3; // Add month number
step7 = step6 + 13; // Add date #: March 13
if(step7 > 7) { 
    remainder = (step7%7);
    console.log(remainder); // 6 = Saturday
};

