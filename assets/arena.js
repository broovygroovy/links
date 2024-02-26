// This allows us to process/render the descriptions, which are in Markdown!
// More about Markdown: https://en.wikipedia.org/wiki/Markdown
let markdownIt = document.createElement('script');
markdownIt.src = 'https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js';
document.head.appendChild(markdownIt);

let channelSlug = 'black-white-ksc5klaxves';

let placeChannelInfo = (data) => {
    let channelTitle = document.getElementById('channel-title');
    let channelDescription = document.getElementById('channel-description');
    let channelCount = document.getElementById('channel-count');
    let channelLink = document.getElementById('channel-link');

    channelTitle.innerHTML = data.title;
    channelDescription.innerHTML = window.markdownit().render(data.metadata.description); 
    channelCount.innerHTML = data.length;
    channelLink.href = `https://www.are.na/channel/${channelSlug}`;
};

let renderBlock = (block) => {
    let channelBlocks = document.getElementById('channel-blocks');

    // Create the HTML element for the block
    let blockElement = document.createElement('li');
    blockElement.dataset.date = block.created_at;

    // Links!
    if (block.class == 'Link') {
        blockElement.innerHTML =
            `
            <div>
                <a href="${block.source.url}">
                    <picture>
                        <source media="(max-width: 428px)" srcset="${block.image.thumb.url}">
                        <source media="(max-width: 640px)" srcset="${block.image.large.url}">
                        <img src="${block.image.original.url}">
                    </picture>
                </a>
            </div>
            `;
    }

    // Images!
    else if (block.class == 'Image') {
        blockElement.innerHTML =
            `
            <div>
                <figure>
                    <img src="${block.image.original.url}">
                </figure>
            </div>
            `;
    }
    // Text!
    else if (block.class == 'Text') {
        blockElement.innerHTML =
            `
            <blockquote>${block.content_html}</blockquote>
            `;
    }

    // Uploaded (not linked) media…
    else if (block.class == 'Attachment') {
        let attachment = block.attachment.content_type;

        // Uploaded videos!
        if (attachment.includes('video')) {
            blockElement.innerHTML =
                `
                <p><em>Video</em></p>
                <video controls src="${block.attachment.url}"></video>
                `;
        }

        // Uploaded PDFs!
        else if (attachment.includes('pdf')) {
            blockElement.innerHTML =
                `
                <a href="${block.attachment.url}">
                    <figure>
                        <img src="${block.image.large.url}">
                    </figure>
                </a>
                `;
        }

        // Uploaded audio!
        else if (attachment.includes('audio')) {
            blockElement.innerHTML =
                `
                <p><em>Audio</em></p>
                <audio controls src="${block.attachment.url}"></audio>
                `;
        }
    }

    // Linked media…
    else if (block.class == 'Media') {
        let embed = block.embed.type;

        // Linked video!
        if (embed.includes('video')) {
            blockElement.innerHTML = block.embed.html;
        }

        // Linked audio!
        else if (embed.includes('rich')) {
            blockElement.innerHTML =
                `
                <p><em>Audio</em></p>
                ${block.embed.html}
                `;
        }
    }

    // Append the block element to the channel blocks container
    channelBlocks.appendChild(blockElement);
};

let renderUser = (user, container) => {
    let userAddress =
        `
        <address>
            <img src="${user.avatar_image.display}">
            <h3>${user.first_name}</h3>
            <p><a href="https://are.na/${user.slug}">Are.na profile ↗</a></p>
        </address>
        `;
    container.insertAdjacentHTML('beforeend', userAddress);
};

// Function to sort the collection based on the selected criteria
let sortCollection = (criteria) => {
    let channelBlocks = document.getElementById('channel-blocks');
    let blocks = Array.from(channelBlocks.children);

    // Sorting logic based on criteria
    if (criteria === 'date') {
        blocks.sort((a, b) => {
            let dateA = new Date(a.dataset.date);
            let dateB = new Date(b.dataset.date);
            return dateA - dateB;
        });
    } else if (criteria === 'title') {
        blocks.sort((a, b) => {
            let titleA = a.dataset.title.toLowerCase();
            let titleB = b.dataset.title.toLowerCase();
            return titleA.localeCompare(titleB);
        });
    }

    // Clear the channel blocks container
    channelBlocks.innerHTML = '';

    // Append sorted blocks to the channel blocks container
    blocks.forEach(block => {
        channelBlocks.appendChild(block);
    });
};

fetch(`https://api.are.na/v2/channels/${channelSlug}?per=100`, { cache: 'no-store' })
    .then((response) => response.json())
    .then((data) => {
        // console.log(data)
        data.contents.reverse().forEach((block) => {
            renderBlock(block);
        });

        let channelUsers = document.getElementById('channel-users');
        data.collaborators.forEach((collaborator) => renderUser(collaborator, channelUsers));
        renderUser(data.user, channelUsers);
    });
