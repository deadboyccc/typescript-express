nnoremap <C-u> <C-u>zz
nnoremap <C-d> <C-d>zz

" Navigation
nnoremap <silent> <C-n> :<C-U>normal! 2j<CR> " Move cursor down 2 lines
nnoremap <silent> <C-p> :<C-U>normal! 2k<CR> " Move cursor up 2 lines 

" Indentation
nnoremap <silent> <Leader>+ :<C-U>normal! >><CR> " Increase indentation
nnoremap <silent> <Leader>- :<C-U>normal! <<<CR> " Decrease indentation

" Search and Replace
nnoremap <silent> <Leader>f :%s/<C-r><C-w>//gc<CR> " Replace current word with next word
nnoremap <silent> <Leader>F :%s/<C-r>=escape(@/, '\\/&')<CR>//gc<CR> " Replace current word with previous word

" Visual Mode
vnoremap <silent> <Leader>y "+y " Yank selected text into unnamed register

" File Operations
nnoremap <silent> <Leader>w :w<CR> " Save file
nnoremap <silent> <Leader>s :w<CR>:q<CR> " Save and quit
nnoremap <silent> <Leader>q :q!<CR> " Quit without saving

" Tabs
nnoremap <silent> <Leader>gt :tabnext<CR> " Go to next tab
nnoremap <silent> <Leader>gT :tabprevious<CR> " Go to previous tab

" Buffers
nnoremap <silent> <Leader>bn :bnext<CR> " Go to next buffer
nnoremap <silent> <Leader>bp :bprevious<CR> " Go to previous buffer

" Window Management
nnoremap <silent> <Leader>vh :vsplit<CR> " Split window vertically
nnoremap <silent> <Leader>hh :split<CR> " Split window horizontally
nnoremap <silent> <Leader>wc :wincmd w<CR> " Close current window

" Macros
nnoremap <silent> <Leader>mqq :<C-U>normal! ggVG"ay<CR>qq@q " Record a macro to select all lines

" Set <Leader> to be comma (,)
let mapleader=","