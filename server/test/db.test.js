import { beforeAll, beforeEach, afterEach, afterAll, expect, test } from 'vitest';
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/../.env' });
//const mongoose = require('mongoose')
const DatabaseFactory = require('../db/database-factory');

// Create  the database manager 
const db = DatabaseFactory.createDatabaseManager();
let testUserId;
let testPlaylistId;
/**
 * Vitest test script for the Playlister app's Mongo Database Manager. Testing should verify that the Mongo Database Manager 
 * will perform all necessarily operations properly.
 *  
 * Scenarios we will test:
 *  1) Reading a User from the database
 *  2) Creating a User in the database
 *  3) ...
 * 
 * You should add at least one test for each database interaction. In the real world of course we would do many varied
 * tests for each interaction.
 */

/**
 * Executed once before all tests are performed.
 */
beforeAll(async () => {
    // SETUP THE CONNECTION VIA MONGOOSE JUST ONCE - IT IS IMPORTANT TO NOTE THAT INSTEAD
    // OF DOING THIS HERE, IT SHOULD BE DONE INSIDE YOUR Database Manager (WHICHEVER)
    // await mongoose
    //     .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
    //     .catch(e => {
    //         console.error('Connection error', e.message)
    //     })
    console.log(`Starting vitest with db: ${process.env.DB_TYPE}`);
    try {
        await db.connect(); 
        console.log(`Database ${process.env.DB_TYPE || 'mongodb'} initialized successfully`);
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
});

/**
 * Executed before each test is performed.
 */
beforeEach(() => {
});

/**
 * Executed after each test is performed.
 */
afterEach(() => {
});

/**
 * Executed once after all tests are performed.
 */
afterAll( async () => {
    try {
        if(db.findUserById(testUserId)){
            await db.deleteUser(testUserId);
            console.log("Cleaned up test user:", testUserId);
        }
        if(db.findPlaylistById(testPlaylistId)){
            await db.deletePlaylist(testPlaylistId);
            console.log("Cleaned up test playlist:", testPlaylistId);
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
});

/**
 * Vitest test to see if the Database Manager can create a User
 */
test('Test #1) Reading a User By Email from the Database', async () => {
    // FILL IN A USER WITH THE DATA YOU EXPECT THEM TO HAVE
    const expectedUser = {
        // FILL IN EXPECTED DATA
        firstName: "Joe",
        lastName: "Shmo",
        email: "joe@shmo.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu",
    };

    // THIS WILL STORE THE DATA RETRUNED BY A READ USER
    const actualUser = await db.findUserByEmail("joe@shmo.com");

    // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
    expect(expectedUser.firstName).toBe(actualUser.firstName);
    expect(expectedUser.lastName).toBe(actualUser.lastName);
    expect(expectedUser.email).toBe(actualUser.email);
    expect(expectedUser.passwordHash).toBe(actualUser.passwordHash);
    // AND SO ON
});
/**
 * Vitest test to see if the Database Manager can get a User.
 */
test('Test #2) Creating a User in the Database', async () => {
    const testUser = {
        firstName: "Tester",
        lastName: "Testing",
        email: "tester@testing.com",
        passwordHash: "$2a$10$m3CK/MyJisdUSRNxTpBrJ.h1IH6pVgpYjKHXk877Z0kYL/8fVhEeC",
        playlists: []
    }

    const createdUser = await db.createUser(testUser);
    testUserId = createdUser._id;
    console.log("testUserId:", testUserId);

    const expectedUser = {
        firstName: "Tester",
        lastName: "Testing",
        email: "tester@testing.com",
        passwordHash: "$2a$10$m3CK/MyJisdUSRNxTpBrJ.h1IH6pVgpYjKHXk877Z0kYL/8fVhEeC",
        playlists: []
    }

    const actualUser = await db.findUserById(testUserId)

    expect(actualUser.firstName).toBe(expectedUser.firstName);
    expect(actualUser.lastName).toBe(expectedUser.lastName);
    expect(actualUser.email).toBe(expectedUser.email);
    expect(actualUser.passwordHash).toBe(expectedUser.passwordHash);
    expect(actualUser.playlists).toEqual(expectedUser.playlists); 
})

// THE REST OF YOUR TEST SHOULD BE PUT BELOW
test('Test #3) Reading a User by _id', async () => {
    const expectedUser = {
        firstName: "Tester",
        lastName: "Testing",
        email: "tester@testing.com",
        passwordHash: "$2a$10$m3CK/MyJisdUSRNxTpBrJ.h1IH6pVgpYjKHXk877Z0kYL/8fVhEeC",
        playlists: []
    }

    const actualUser = await db.findUserById(testUserId);
    expect(actualUser.firstName).toBe(expectedUser.firstName);
    expect(actualUser.lastName).toBe(expectedUser.lastName);
    expect(actualUser.email).toBe(expectedUser.email);
    expect(actualUser.passwordHash).toBe(expectedUser.passwordHash);
    expect(actualUser.playlists).toEqual(expectedUser.playlists); 
})

test('Test #4) Creating a Playlist', async () => {
    const testPlaylist = {
        ownerEmail: "tester@testing.com",
        name: "Spacey",
        songs: [
        {
            title: "Across the Universe",
            artist: "The Beatles",
            year: 1969,
            youTubeId: "90M60PzmxEE"
        },
        {
            title: "Astronomy Domine",
            artist: "Pink Floyd",
            year: 1967,
            youTubeId: "8UbNbor3OqQ"
        }]
    }

    const actualPlaylist = await db.createPlaylist(testPlaylist);
    testPlaylistId = actualPlaylist._id;
    expect(actualPlaylist.ownerEmail).toBe(testPlaylist.ownerEmail);
    expect(actualPlaylist.name).toBe(testPlaylist.name);
    const songsWithoutIds = actualPlaylist.songs.map(({ _id, ...song }) => song);
    expect(songsWithoutIds).toEqual(testPlaylist.songs);
})

test('Test #5) Reading a Playlist by Id', async () => {
    const expectedPlaylist = {
        _id: testPlaylistId,
        ownerEmail: "tester@testing.com",
        name: "Spacey",
        songs: [
        {
            title: "Across the Universe",
            artist: "The Beatles",
            year: 1969,
            youTubeId: "90M60PzmxEE"
        },
        {
            title: "Astronomy Domine",
            artist: "Pink Floyd",
            year: 1967,
            youTubeId: "8UbNbor3OqQ"
        }]
    }

    const actualPlaylist = await db.findPlaylistById(testPlaylistId);

    expect(actualPlaylist.ownerEmail).toBe(expectedPlaylist.ownerEmail);
    expect(actualPlaylist.name).toBe(expectedPlaylist.name);
    const songsWithoutIds = actualPlaylist.songs.map(({ _id, ...song }) => song);
    expect(songsWithoutIds).toEqual(expectedPlaylist.songs);
})

test('Test #6) Reading Playlists by OwnerEmail', async () => {
    const expectedPlaylists = [{
        _id: testPlaylistId,
        ownerEmail: "tester@testing.com",
        name: "Spacey",
        songs: [
            {
                title: "Across the Universe",
                artist: "The Beatles", 
                year: 1969,
                youTubeId: "90M60PzmxEE"
            },
            {
                title: "Astronomy Domine",
                artist: "Pink Floyd",
                year: 1967,
                youTubeId: "8UbNbor3OqQ"
            }
        ]
    }]

    const actualPlaylists = await db.findPlaylistsByOwnerEmail("tester@testing.com");

    expect(actualPlaylists).toHaveLength(expectedPlaylists.length);

    actualPlaylists.forEach((actualPlaylist, index) => {
        const expectedPlaylist = expectedPlaylists[index];
        
        expect(actualPlaylist.name).toBe(expectedPlaylist.name);
        expect(actualPlaylist.ownerEmail).toBe(expectedPlaylist.ownerEmail);
        
        expect(actualPlaylist.songs).toHaveLength(expectedPlaylist.songs.length);
        
        actualPlaylist.songs.forEach((actualSong, songIndex) => {
            const expectedSong = expectedPlaylist.songs[songIndex];
            expect(actualSong.title).toBe(expectedSong.title);
            expect(actualSong.artist).toBe(expectedSong.artist);
            expect(actualSong.year).toBe(expectedSong.year);
            expect(actualSong.youTubeId).toBe(expectedSong.youTubeId);
        });
    });
});

test('Test #7) Update Playlists', async () => {
    const updateData = {
        name: "Updated Playlist Name",
        songs: [
            {
                title: "New Song 1",
                artist: "New Artist 1",
                year: 2024,
                youTubeId: "new123"
            },
            {
                title: "New Song 2",
                artist: "New Artist 2", 
                year: 2023,
                youTubeId: "new456"
            }
        ]
    }

    const originalPlaylist = await db.findPlaylistById(testPlaylistId)
    const updatedPlaylist = await db.updatePlaylist(testPlaylistId, updateData);

    expect(updatedPlaylist._id).toBe(testPlaylistId);
    expect(updatedPlaylist.name).toBe(updateData.name);
    expect(updatedPlaylist.ownerEmail).toBe(originalPlaylist.ownerEmail);
    expect(updatedPlaylist.songs).toHaveLength(updateData.songs.length);
    
    updatedPlaylist.songs.forEach((actualSong, index) => {
        const expectedSong = updateData.songs[index];
        expect(actualSong.title).toBe(expectedSong.title);
        expect(actualSong.artist).toBe(expectedSong.artist);
        expect(actualSong.year).toBe(expectedSong.year);
        expect(actualSong.youTubeId).toBe(expectedSong.youTubeId);
    });
});

test('Test #8) Deleting a Playlist', async () => {
    // Delete the playlist
    const playlistBeforeDelete = await db.findPlaylistById(testPlaylistId);
    expect(playlistBeforeDelete).not.toBeNull();
    expect(playlistBeforeDelete._id).toBe(testPlaylistId);

    const deleteResult = await db.deletePlaylist(testPlaylistId);
    expect(deleteResult).toBe(true); // Should return true for successful deletion

    // Verify playlist no longer exists
    const playlistAfterDelete = await db.findPlaylistById(testPlaylistId);
    expect(playlistAfterDelete).toBeNull();
})