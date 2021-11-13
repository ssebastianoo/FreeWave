import youtube_dl

ydl_opts = {
    'format': 'bestaudio',
}

ytdl =  youtube_dl.YoutubeDL(ydl_opts)
info = ytdl.extract_info('https://www.youtube.com/watch?v=BaW_jenozKc', download=False)
print(info['formats'][0]['url'])