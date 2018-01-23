<p>New relative with age, under 14:</p>
<ul>
    <li><b>full name: </b><?php echo $relative['fullname']; ?></li>
    <li><b>email: </b><?php echo $relative['email']; ?></li>
    <li><b>telephone: </b><?php echo $relative['phone']; ?></li>
    <li><b>gender: </b><?php echo $relative['gender']; ?></li>
</ul>
<p>Invited by student:</p>
<ul>
    <li><b>full name: </b><?php echo $student['user_fullname']; ?></li>
    <li><b>email: </b><?php echo $student['user_email_address']; ?></li>
    <li><b>city: </b><?php echo $student['city']; ?></li>
    <li><b>address: </b><?php echo $student['profile_address2'] . ' ' . $student['profile_address']; ?></li>
    <li><b>telephone: </b><?php echo $student['profile_telephone']; ?></li>
    <li><b>mobile: </b><?php echo $student['profile_mobile']; ?></li>
</ul>