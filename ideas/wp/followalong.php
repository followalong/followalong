<?php
/*
Plugin Name: RSS Memberships
Plugin URI: http://www.followalong.net
Description: Restrict pages and posts on your site based on the user's membership (paid or free).
Version: 1.0.0
Contributors: rss-memberships
Author: FollowAlong
Author URI: http://www.followalong.net
Text Domain: followalong
Tags: rss, membership, subscription, subscribe, feeds, follow along, followalong
Requires at least: 3.0.1
Tested up to: 5.2.4
Stable tag: 1.0.0
License: MIT

Copyright (c) 2018-2019 FollowAlong.

ini_set("display_errors",1);
ini_set("display_startup_errors",1);
error_reporting(-1);
*/

class RSSMemberships {
  public static $rss_memberships_instance;
  const version = '1.0.0';
  const debug = false;

  public static function init() {
    if ( is_null( self::$rss_memberships_instance ) ) { self::$rss_memberships_instance = new RSSMemberships(); }
    return self::$rss_memberships_instance;
  }

  private function __construct() {
    // define('RSS_MEMBERSHIPS_ROOT', dirname(__FILE__));
  }

  public static function admin_init() {
    // Set "subscriptions" allowed to view a post/page
  }

  public static function admin_page() {
    // require_once 'page.php';
  }

  public static function menu_page() {
    add_menu_page( 'RSS Memberships', 'RSS Memberships', 7, 'followalong', array('RSSMemberships', 'admin_page'), 'dashicons-welcome-widgets-menus', 25 );
  }

  public static function public_api() {

  }
}

RSSMemberships::init();

?>
