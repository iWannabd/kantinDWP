<?php

use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use App\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // $this->call(UsersTableSeeder::class);
        $users = array(
            ['name' => 'Ryan Chenkie','role' => 'admin', 'email' => 'ryanchenkie@gmail.com', 'password' => Hash::make('secret')],
            ['name' => 'Chris Sevilleja','role' => 'admin', 'email' => 'chris@scotch.io', 'password' => Hash::make('secret')],
            ['name' => 'Holly Lloyd','role' => 'admin', 'email' => 'holly@scotch.io', 'password' => Hash::make('secret')],
            ['name' => 'Adnan Kukic','role' => 'admin', 'email' => 'adnan@scotch.io', 'password' => Hash::make('secret')],
            ['name' => 'Isa Setiawan','role' => 'admin', 'email' => 'azaqokay@gmail.com', 'password' => Hash::make('rahasia')],

        );

        // Loop through each user above and create the record for them in the database
        foreach ($users as $user)
        {
            User::create($user);
        }

        Model::reguard();
    }
}
