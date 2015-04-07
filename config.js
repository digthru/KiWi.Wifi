module.exports = {
    token_expiration_time: 45 * 60 * 1000, // 45 mins
    default_profile_picture: 'https://s-media-cache-ak0.pinimg.com/originals/28/c7/ad/28c7adffc9af705dcd8a8b77b1a9c0e8.jpg',
    registration_algorithm: 'aes-256-ctr',
    registration_symmetric_key: 'jkcm',
    registration_password: '123456',
    default_lock_name: "MyKiWi",
    default_client_id: "dev",
    max_sockets_per_token: 3,
    private_field_algorithm: 'aes-256-ctr',
    lock_serial: 'prototype',
    domain: 'kiwi.t.proxylocal.com',
    production: true,
    xbee_destination_64: "0013A200408A20BA"
};