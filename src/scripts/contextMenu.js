/**
 * @description	This module is used for the context menu.
 * @copyright	2014 by Tobias Reich
 */

contextMenu = {}

contextMenu.add = function(e) {

	var items = [
		{ type: 'item', title: 'Upload Photo', icon: 'icon-picture', fn: function() { $('#upload_files').click() } },
		{ type: 'separator' },
		{ type: 'item', title: 'New Album', icon: 'icon-folder-close', fn: album.add }
	];

	basicContext.show(items, e);

	upload.notify();

}

contextMenu.settings = function(e) {

	var items = [
		{ type: 'item', title: 'Change Sorting', icon: 'icon-sort', fn: settings.setSorting },
		{ type: 'separator' },
		{ type: 'item', title: 'About Lychee', icon: 'icon-info-sign', fn: function() { window.open(lychee.website) } },
		{ type: 'item', title: 'Diagnostics', icon: 'icon-dashboard', fn: function() { window.open('plugins/check/', '_self') } },
		{ type: 'item', title: 'Show Log', icon: 'icon-list', fn: function() { window.open('plugins/displaylog/', '_self') } },
	];

	basicContext.show(items, e);

}

contextMenu.album = function(albumID, e) {

	if (albumID==='0'||albumID==='f'||albumID==='s'||albumID==='r') return false;

	var items = [
		{ type: 'item', title: 'Rename', icon: 'icon-edit', fn: function() { album.setTitle([albumID]) } },
		{ type: 'item', title: 'Delete', icon: 'icon-trash', fn: function() { album.delete([albumID]) } }
	];

	$('.album[data-id="' + albumID + '"]').addClass('active');

	basicContext.show(items, e, contextMenu.close);

}

contextMenu.albumMulti = function(albumIDs, e) {

	multiselect.stopResize();

	var items = [
		{ type: 'item', title: 'Rename All', icon: 'icon-edit', fn: function() { album.setTitle(albumIDs) } },
		{ type: 'item', title: 'Delete All', icon: 'icon-trash', fn: function() { album.delete(albumIDs) } }
	];

	basicContext.show(items, e, contextMenu.close);

}

contextMenu.photo = function(photoID, e) {

	// Notice for 'Move':
	// fn must call basicContext.close() first,
	// in order to keep the selection

	var items = [
		{ type: 'item', title: 'Star', icon: 'icon-star', fn: function() { photo.setStar([photoID]) } },
		{ type: 'item', title: 'Tags', icon: 'icon-tags', fn: function() { photo.editTags([photoID]) } },
		{ type: 'separator' },
		{ type: 'item', title: 'Rename', icon: 'icon-edit', fn: function() { photo.setTitle([photoID]) } },
		{ type: 'item', title: 'Duplicate', icon: 'icon-copy', fn: function() { photo.duplicate([photoID]) } },
		{ type: 'item', title: 'Move', icon: 'icon-folder-open', fn: function() { basicContext.close(); contextMenu.move([photoID], e); } },
		{ type: 'item', title: 'Delete', icon: 'icon-trash', fn: function() { photo.delete([photoID]) } }
	];

	$('.photo[data-id="' + photoID + '"]').addClass('active');

	basicContext.show(items, e, contextMenu.close);

}

contextMenu.photoMulti = function(photoIDs, e) {

	// Notice for 'Move All':
	// fn must call basicContext.close() first,
	// in order to keep the selection and multiselect

	multiselect.stopResize();

	var items = [
		{ type: 'item', title: 'Star All', icon: 'icon-star', fn: function() { photo.setStar(photoIDs) } },
		{ type: 'item', title: 'Tag All', icon: 'icon-tags', fn: function() { photo.editTags(photoIDs) } },
		{ type: 'separator' },
		{ type: 'item', title: 'Rename All', icon: 'icon-edit', fn: function() { photo.setTitle(photoIDs) } },
		{ type: 'item', title: 'Duplicate All', icon: 'icon-copy', fn: function() { photo.duplicate(photoIDs) } },
		{ type: 'item', title: 'Move All', icon: 'icon-folder-open', fn: function() { basicContext.close(); contextMenu.move(photoIDs, e); } },
		{ type: 'item', title: 'Delete All', icon: 'icon-trash', fn: function() { photo.delete(photoIDs) } }
	];

	basicContext.show(items, e, contextMenu.close);

}

contextMenu.photoMore = function(photoID, e) {

	var items = [
		{ type: 'item', title: 'Full Photo', icon: 'icon-resize-full', fn: function() { window.open(photo.getDirectLink()) } },
		{ type: 'item', title: 'Download', icon: 'icon-circle-arrow-down', fn: function() { photo.getArchive(photoID) } }
	];

	// Remove download-item when
	// 1) In public mode
	// 2) Downloadable not 1 or not found
	if (!(album.json&&album.json.downloadable&&album.json.downloadable==='1')&&
		lychee.publicMode===true) items.splice(1, 1);

	basicContext.show(items, e);

}

contextMenu.move = function(photoIDs, e) {

	var items = [];

	// Show Unsorted when unsorted is not the current album
	if (album.getID()!=='0') {

		items = [
			{ type: 'item', title: 'Unsorted', fn: function() { photo.setAlbum(photoIDs, 0) } },
			{ type: 'separator' }
		];

	}

	lychee.api('getAlbums', function(data) {

		if (data.num===0) {

			// Show only 'Add album' when no album available
			items = [
				{ type: 'item', title: 'New Album', fn: album.add }
			];

		} else {

			// Generate list of albums
			$.each(data.content, function(index) {

				var that = this;

				if (!that.thumb0) that.thumb0 = 'src/images/no_cover.svg';
				that.title = "<img class='albumCover' width='16' height='16' src='" + that.thumb0 + "'><div class='albumTitle'>" + that.title + "</div>";

				if (that.id!=album.getID()) items.push({ type: 'item', title: that.title, fn: function() { photo.setAlbum(photoIDs, that.id) } });

			});

		}

		basicContext.show(items, e, contextMenu.close);

	});

}

contextMenu.sharePhoto = function(photoID, e) {

	var link = photo.getViewLink(photoID);
	if (photo.json.public==='2') link = location.href;

	var items = [
		{ type: 'item', title: 'Copy url from your address bar to share', fn: function() {}, class: 'noHover' },
		{ type: 'separator' },
		{ type: 'item', title: 'Make Private', icon: 'icon-eye-close', fn: function() { photo.setPublic(photoID) } },
	];

	basicContext.show(items, e);
	$('.basicContext input#link').focus().select();

}

contextMenu.shareAlbum = function(albumID, e) {

	var items = [
		{ type: 'item', title: 'Copy url from your address bar to share', fn: function() {}, class: 'noHover' },
		{ type: 'separator' },
		{ type: 'item', title: 'Make Private', icon: 'icon-eye-close', fn: function() { album.setPublic(albumID) } },
	];

	basicContext.show(items, e);
	$('.basicContext input#link').focus().select();

}

contextMenu.close = function() {

	if (!visible.contextMenu()) return false;

	basicContext.close();

	$('.photo.active, .album.active').removeClass('active');
	if (visible.multiselect()) multiselect.close();

}
