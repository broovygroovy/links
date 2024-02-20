// This allows us to process/render the descriptions, which are in Markdown!
// More about Markdown: https://en.wikipedia.org/wiki/Markdown
let markdownIt = document.createElement('script')
markdownIt.src = 'https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js'
document.head.appendChild(markdownIt)

let channelSlug = 'black-white-ksc5klaxves' 

let placeChannelInfo = (data) => {

	let channelTitle = document.getElementById('channel-title')
	let channelDescription = document.getElementById('channel-description')
	let channelCount = document.getElementById('channel-count')
	let channelLink = document.getElementById('channel-link')


	channelTitle.innerHTML = data.title
	channelDescription.innerHTML = window.markdownit().render(data.metadata.description) // Converts Markdown → HTML
	channelCount.innerHTML = data.length
	channelLink.href = `https://www.are.na/channel/${channelSlug}`
}

let renderBlock = (block) => {
	let channelBlocks = document.getElementById('channel-blocks')

	// Links!
	if (block.class == 'Link') {
		let linkItem =
			`
			<li>
				<div>
				<a href="${ block.source.url }">
					<picture>
						<source media="(max-width: 428px)" srcset="${ block.image.thumb.url }">
						<source media="(max-width: 640px)" srcset="${ block.image.large.url }">
						<img src="${ block.image.original.url }">
					</picture>
				</a>
				</div>
			</li>
			`
		channelBlocks.insertAdjacentHTML('beforeend', linkItem)
	}

	// Images!
	else if (block.class == 'Image') {
		console.log(block);
		let imageItem = 
		`
			<li>
			<div>	
				<figure>
					<img src="${ block.image.original.url }">
				</figure>
				</div>
			</li>
		`
		channelBlocks.insertAdjacentHTML('beforeend', imageItem);
	}

	// Uploaded (not linked) media…
	else if (block.class == 'Attachment') {
		let attachment = block.attachment.content_type

		// Uploaded videos!
		if (attachment.includes('video')) {
			let videoItem =
				`
				<li>
					<p><em>Video</em></p>
					<video controls src="${ block.attachment.url }"></video>
				</li>
				`
			channelBlocks.insertAdjacentHTML('beforeend', videoItem)
		}

		// Uploaded PDFs!
		else if (attachment.includes('pdf')) {
			
			 		let pdfItem =
			 			`
			 				<li>
			 					<a href="${block.attachment.url}">
			 						<figure>
			 							<img src="${block.image.large.url}">
			 						</figure>
			 					</a>
			 				</li>
			 			`
			 		channelBlocks.insertAdjacentHTML('beforeend', pdfItem);
			 	}

		// Uploaded audio!
		else if (attachment.includes('audio')) {
			let audioItem =
				`
				<li>
					<p><em>Audio</em></p>
					<audio controls src="${ block.attachment.url }"></video>
				</li>
				`
			channelBlocks.insertAdjacentHTML('beforeend', audioItem)
		}
	}

	// Linked media…
	else if (block.class == 'Media') {
		let embed = block.embed.type
		
		// Linked video!
		if (embed.includes('video')) {
	
			let linkedVideoItem =
				`
				<li>
					${ block.embed.html }
				</li>
				`
			channelBlocks.insertAdjacentHTML('beforeend',linkedVideoItem)
		}

		// Linked audio!
		else if (embed.includes('rich')) {
			`
			<li>
				<p><em>Audio</em></p>
				${block.embed.html}
			</li>
			`
		}
	}
}

let renderUser = (user, container) => {
	let userAddress =
		`
		<address>
			<img src="${ user.avatar_image.display }">
			<h3>${ user.first_name }</h3>
			<p><a href="https://are.na/${ user.slug }">Are.na profile ↗</a></p>
		</address>
		`
	container.insertAdjacentHTML('beforeend', userAddress)
}

fetch(`https://api.are.na/v2/channels/${channelSlug}?per=100`, { cache: 'no-store' })
	.then((response) => response.json())
	.then((data) => {
		console.log(data)
		data.contents.reverse().forEach((block) => {
			renderBlock(block)
		})

		let channelUsers = document.getElementById('channel-users') 
		data.collaborators.forEach((collaborator) => renderUser(collaborator, channelUsers))
		renderUser(data.user, channelUsers)
	})
